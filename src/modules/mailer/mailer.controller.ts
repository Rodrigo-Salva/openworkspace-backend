import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MailerService } from './mailer.service';
import { SendInviteMailDto, SendTestMailDto } from './dto/mailer.dto';

@ApiTags('Mailer')
@Controller('api/mailer')
export class MailerController {
  constructor(private readonly mailerService: MailerService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get current mailer configuration and operational status' })
  @ApiResponse({ status: 200, description: 'Mailer operational status' })
  getStatus() {
    return {
      code: 0,
      message: 'Ok',
      data: this.mailerService.getStatus(),
    };
  }

  @Post('test')
  @ApiOperation({ summary: 'Send test email via SMTP or Console fallback' })
  @ApiResponse({ status: 200, description: 'Email delivery response' })
  async sendTestMail(@Body() dto: SendTestMailDto) {
    const result = await this.mailerService.sendMail({
      to: dto.to,
      subject: dto.subject,
      text: dto.body || dto.subject,
      html: dto.body ? `<p>${dto.body}</p>` : undefined,
    });
    return {
      code: 0,
      message: 'Ok',
      data: result,
    };
  }

  @Post('invite')
  @ApiOperation({ summary: 'Send workspace invite email using branded template' })
  @ApiResponse({ status: 200, description: 'Invitation email queued or sent' })
  async sendInvite(@Body() dto: SendInviteMailDto) {
    const result = await this.mailerService.sendWorkspaceInvite(dto.to, {
      username: dto.inviterName,
      workspaceName: dto.workspaceName,
      acceptUrl: dto.acceptUrl,
    });
    return {
      code: 0,
      message: 'Ok',
      data: result,
    };
  }
}
