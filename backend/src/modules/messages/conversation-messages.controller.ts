import {
  Body,
  Controller,
  Param,
  Post,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { OpenClawGatewayService } from '../openclaw/openclaw.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { MessageAttachment } from 'src/types/MessageAttachment';

@Controller('conversations')
export class ConversationMessagesController {
  constructor(private readonly openClawService: OpenClawGatewayService) {}

  @UseInterceptors(FilesInterceptor('attachments', 10))
  @Post('/:conversationId/messages/stream')
  sendMessage(
    @Param('conversationId') conversationId: string,
    @Body('message') message: string,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Res() res: Response,
  ): void {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const attachments: MessageAttachment[] = (files ?? []).map((f) => ({
      mimeType: f.mimetype,
      content: `data:${f.mimetype};base64,${f.buffer.toString('base64')}`,
    }));

    const stream$ = this.openClawService.sendMessage(conversationId, {
      message,
      attachments,
    });

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
