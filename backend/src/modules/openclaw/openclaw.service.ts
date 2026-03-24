import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ConnectionChallengePayload,
  FrameType,
  GatewayFrame,
} from 'src/types/PreConnectChallengeRequest';
import * as WebSocket from 'ws';
import { DeviceIdentityService } from './device-identity.service';

@Injectable()
export class OpenClawGatewayService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OpenClawGatewayService.name);

  private webSocket: WebSocket;

  private gatewayToken: string;
  private gatewayUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly deviceIdentityService: DeviceIdentityService,
  ) {
    this.gatewayUrl = this.configService.getOrThrow<string>('OPENCLAW_WS_URL');
    this.gatewayToken = this.configService.getOrThrow<string>(
      'OPENCLAW_GATEWAY_TOKEN',
    );
  }

  onModuleInit() {
    this.connect();
  }

  onModuleDestroy() {
    this.webSocket?.close();
  }

  private connect() {
    this.webSocket = new WebSocket(this.gatewayUrl);

    this.webSocket.on('open', () => {
      this.logger.log('WebSocket connection opened, awaiting challenge...');
    });

    this.webSocket.on('message', (raw: WebSocket.RawData) => {
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      this.handleMessage(JSON.parse(raw.toString()) as GatewayFrame);
    });

    this.webSocket.on('close', (code: number, reason: Buffer) => {
      this.logger.warn(
        `WebSocket closed — code=${code} reason=${reason.toString()}`,
      );
    });

    this.webSocket.on('error', (error) => {
      this.logger.error(`WebSocket error — ${error.message}`);
    });
  }

  private handleMessage(message: GatewayFrame): void {
    if (
      message.type === FrameType.EVENT &&
      message.event === 'connect.challenge'
    ) {
      this.handleChallenge(message.payload as ConnectionChallengePayload);
      return;
    }

    if (message.type == FrameType.RESPONSE && message.id === 'connect') {
      if (message.ok) {
        this.handleHelloOk(message.payload);
      }

      return;
    }
  }

  private handleChallenge(payload: ConnectionChallengePayload) {
    const { nonce } = payload;

    const deviceBlock = this.deviceIdentityService.buildDeviceBlock(
      nonce,
      this.gatewayToken,
    );

    const connectRequest = {
      type: 'req',
      id: 'connect',
      method: 'connect',
      params: {
        minProtocol: 3,
        maxProtocol: 3,
        client: {
          id: 'gateway-client',
          version: '1.0.0',
          platform: 'node',
          mode: 'backend',
        },
        role: 'operator',
        scopes: ['operator.read', 'operator.write'],
        caps: [],
        commands: [],
        permissions: {},
        auth: { token: this.gatewayToken },
        locale: 'en-US',
        userAgent: 'solven/1.2.3',
        device: deviceBlock,
      },
    };

    this.send(connectRequest);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private handleHelloOk(payload: unknown) {
    if (
      payload !== null &&
      typeof payload === 'object' &&
      'type' in payload &&
      payload.type === 'hello-ok'
    ) {
      this.logger.log(`✅ Connected to OpenClaw Gateway`);
    }

    // if (payload.auth?.deviceToken) {
    //   this.deviceToken = payload.auth.deviceToken;
    //   this.logger.log('Device token received and cached');
    // }
  }

  private send(payload: object) {
    if (this.webSocket?.readyState === WebSocket.OPEN) {
      const message: string = JSON.stringify(payload);

      this.webSocket.send(message);
    } else {
      this.logger.warn('Tried to send but WebSocket is not open');
    }
  }
}
