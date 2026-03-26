import { Module } from '@nestjs/common';
import { OpenclawModule } from './modules/openclaw/openclaw.module';
import { ConfigModule } from '@nestjs/config';
import { MessagesModule } from './modules/messages/messages.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    OpenclawModule,
    MessagesModule,
  ],
})
export class AppModule {}
