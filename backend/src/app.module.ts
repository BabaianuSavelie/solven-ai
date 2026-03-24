import { Module } from '@nestjs/common';
import { OpenclawModule } from './modules/openclaw/openclaw.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), OpenclawModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
