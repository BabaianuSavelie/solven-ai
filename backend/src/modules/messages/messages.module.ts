import { Module } from '@nestjs/common';
import { ConversationMessagesController } from './conversation-messages.controller';
import { OpenclawModule } from '../openclaw/openclaw.module';

@Module({
  imports: [OpenclawModule],
  controllers: [ConversationMessagesController],
})
export class MessagesModule {}
