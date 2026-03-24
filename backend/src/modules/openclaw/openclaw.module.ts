import { Module } from '@nestjs/common';
import { OpenClawGatewayService } from './openclaw.service';
import { DeviceIdentityService } from './device-identity.service';

@Module({
  controllers: [],
  providers: [OpenClawGatewayService, DeviceIdentityService],
  exports: [OpenClawGatewayService],
})
export class OpenclawModule {}
