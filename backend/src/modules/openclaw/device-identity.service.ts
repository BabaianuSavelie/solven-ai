import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createHash,
  sign,
  generateKeyPairSync,
  KeyObject,
  createPrivateKey,
  createPublicKey,
} from 'crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export interface DeviceSignature {
  deviceId: string;
  publicKey: string;
  signature: string;
  signedAt: number;
  nonce: string;
}

@Injectable()
export class DeviceIdentityService implements OnModuleInit {
  private readonly logger = new Logger(DeviceIdentityService.name);

  private privateKey: KeyObject;
  private publicKey: KeyObject;
  private _deviceId: string;

  private readonly keysDir: string;
  private readonly privateKeyPath: string;
  private readonly publicKeyPath: string;

  constructor(private readonly configService: ConfigService) {
    this.keysDir = this.configService.get<string>(
      'OPENCLAW_KEYS_DIR',
      join(process.cwd(), '.openclaw'),
    );
    this.privateKeyPath = join(this.keysDir, 'device.private.pem');
    this.publicKeyPath = join(this.keysDir, 'device.public.pem');
  }

  onModuleInit() {
    this.loadOrGenerateKeys();
  }

  get deviceId(): string {
    return this._deviceId;
  }

  /**
   * Returns the raw Ed25519 public key as base64url (JWK x field).
   */
  getPublicKeyBase64(): string {
    const jwk = this.publicKey.export({ format: 'jwk' }) as { x: string };
    return jwk.x;
  }

  /**
   * Signs the challenge using the v3 payload format expected by the gateway.
   */
  signChallenge(
    nonce: string,
    token: string,
    role: string = 'operator',
    scopes: string[] = ['operator.read', 'operator.write'],
  ): DeviceSignature {
    const signedAt = Date.now();

    const payload = [
      'v3',
      this.deviceId,
      'gateway-client',
      'backend',
      role,
      scopes.join(','),
      String(signedAt),
      token,
      nonce,
      'node',
      '',
    ].join('|');

    const signature = sign(
      null,
      Buffer.from(payload),
      this.privateKey,
    ).toString('base64url');

    this.logger.debug(
      `Signed challenge nonce=${nonce} deviceId=${this.deviceId}`,
    );

    return {
      deviceId: this.deviceId,
      publicKey: this.getPublicKeyBase64(),
      signature,
      signedAt,
      nonce,
    };
  }

  /**
   * Builds the full `device` block for the connect request payload.
   */
  buildDeviceBlock(
    nonce: string,
    token: string,
    role?: string,
    scopes?: string[],
  ) {
    const signed = this.signChallenge(nonce, token, role, scopes);

    return {
      id: signed.deviceId,
      publicKey: signed.publicKey,
      signature: signed.signature,
      signedAt: signed.signedAt,
      nonce: signed.nonce,
    };
  }

  // ─── Key Management ────────────────────────────────────────────────────────

  private loadOrGenerateKeys(): void {
    if (this.keysExistOnDisk()) {
      this.loadKeysFromDisk();
      this.logger.log(`Device identity loaded — deviceId=${this.deviceId}`);
    } else {
      this.generateAndSaveKeys();
      this.logger.log(`Device identity generated — deviceId=${this.deviceId}`);
    }
  }

  private keysExistOnDisk(): boolean {
    return existsSync(this.privateKeyPath) && existsSync(this.publicKeyPath);
  }

  private loadKeysFromDisk(): void {
    const privatePem = readFileSync(this.privateKeyPath, 'utf8');
    const publicPem = readFileSync(this.publicKeyPath, 'utf8');

    this.privateKey = createPrivateKey(privatePem);
    this.publicKey = createPublicKey(publicPem);
    this._deviceId = this.deriveDeviceId(this.publicKey);
  }

  private generateAndSaveKeys(): void {
    // Ensure the directory exists
    if (!existsSync(this.keysDir)) {
      mkdirSync(this.keysDir, { recursive: true });
    }

    const { privateKey, publicKey } = generateKeyPairSync('ed25519', {
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });

    // Persist to disk — generated only once
    writeFileSync(this.privateKeyPath, privateKey, { mode: 0o600 }); // owner read/write only
    writeFileSync(this.publicKeyPath, publicKey, { mode: 0o644 });

    this.privateKey = createPrivateKey(privateKey);
    this.publicKey = createPublicKey(publicKey);
    this._deviceId = this.deriveDeviceId(this.publicKey);
  }

  /**
   * Derives a stable, deterministic device ID from the public key.
   * SHA-256 of the raw 32-byte Ed25519 key (JWK x field), full hex.
   */
  private deriveDeviceId(publicKey: KeyObject): string {
    const jwk = publicKey.export({ format: 'jwk' }) as { x: string };
    const rawKey = Buffer.from(jwk.x, 'base64url');
    return createHash('sha256').update(rawKey).digest('hex');
  }
}
