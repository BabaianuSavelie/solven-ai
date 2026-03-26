import { Body, Controller, Param, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { OpenClawGatewayService } from '../openclaw/openclaw.service';
import { MessageRequest } from './dtos/request/message.request';

@Controller('conversations')
export class ConversationMessagesController {
  constructor(private readonly openClawService: OpenClawGatewayService) {}

  @Post('/:conversationId/messages/stream')
  sendMessage(
    @Param('conversationId') conversationId: string,
    @Body() body: MessageRequest,
    @Res() res: Response,
  ): void {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const stream$ = this.openClawService.sendMessage(
      conversationId,
      body.message,
    );

    stream$.subscribe({
      next: (event) => {
        if (event.type === 'text') {
          res.write(`data: ${JSON.stringify({ text: event.delta })}\n\n`);
        } else if (event.type === 'tool') {
          res.write(
            `event: tool\ndata: ${JSON.stringify({ name: event.name, input: event.input })}\n\n`,
          );
        }
      },
      error: (err: unknown) => {
        res.write(`event: error\ndata: ${JSON.stringify({ error: err })}\n\n`);
        res.end();
      },
      complete: () => res.end(),
    });
  }
}
