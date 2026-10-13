import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import {
  SendMailOptions,
  WorkspaceInviteParam,
  WorkspaceAccessRequestParam,
  WorkspaceAccessRequestApprovedMailerParam,
  PageMentionNotificationMailerParam,
  ImportNotionMailerParam,
  MagicLinkParam,
} from './mailer.interface';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private transporter: nodemailer.Transporter | null = null;
  private readonly isConfigured: boolean = false;
  private readonly fromAddress: string;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = Number(this.configService.get<string>('SMTP_PORT') || 587);
    const user = this.configService.get<string>('SMTP_USER') || this.configService.get<string>('SMTP_USERNAME');
    const pass = this.configService.get<string>('SMTP_PASS') || this.configService.get<string>('SMTP_PASSWORD');
    const secure = this.configService.get<string>('SMTP_SECURE') === 'true' || port === 465;
    this.fromAddress = this.configService.get<string>('SMTP_FROM') || 'OpenWorkspace Cloud <noreply@openworkspace.io>';

    if (host && user) {
      try {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure,
          auth: { user, pass },
        });
        this.isConfigured = true;
        this.logger.log(`SMTP Mailer initialized successfully connecting to ${host}:${port} as ${user}`);
      } catch (err: any) {
        this.logger.error(`Failed to initialize SMTP transporter: ${err.message}`);
      }
    } else {
      this.logger.warn(
        `SMTP_HOST or SMTP_USER not provided in environment. Mailer running in CONSOLE/DEV fallback mode (emails will be logged to console).`,
      );
    }
  }

  getStatus() {
    return {
      enabled: this.isConfigured,
      mode: this.isConfigured ? 'smtp' : 'console_fallback',
      host: this.configService.get<string>('SMTP_HOST') || null,
      port: Number(this.configService.get<string>('SMTP_PORT') || 587),
      from: this.fromAddress,
    };
  }

  async sendMail(options: SendMailOptions): Promise<{ success: boolean; messageId?: string; mode: string }> {
    if (this.isConfigured && this.transporter) {
      try {
        const info = await this.transporter.sendMail({
          from: this.fromAddress,
          to: options.to,
          subject: options.subject,
          text: options.text || options.subject,
          html: options.html,
        });
        this.logger.log(`Email successfully delivered via SMTP to ${options.to} [ID: ${info.messageId}]`);
        return { success: true, messageId: info.messageId, mode: 'smtp' };
      } catch (err: any) {
        this.logger.error(`Error sending email to ${options.to} via SMTP: ${err.message}. Falling back to console log.`);
      }
    }

    // Console Dev Fallback
    const divider = '─'.repeat(70);
    this.logger.log(`\n┌${divider}┐\n` +
      `│ 📧 [OPENWORKSPACE MAILER - CONSOLE FALLBACK]\n` +
      `│ To:      ${options.to}\n` +
      `│ Subject: ${options.subject}\n` +
      `│ Body:\n` +
      `│ ${options.text || (options.html ? '[HTML Content]' : '(empty)')}\n` +
      `└${divider}┘\n`);

    return { success: true, messageId: `console-${Date.now()}`, mode: 'console' };
  }

  async sendMagicLink(email: string, link: string) {
    const subject = 'Your OpenWorkspace login link';
    const html = this.renderEmailLayout({
      title: 'Sign in to OpenWorkspace',
      greeting: 'Hello,',
      paragraphs: [
        'You requested a secure login link for your OpenWorkspace account.',
        'Click the button below to sign in instantly. This link will expire shortly.',
      ],
      buttonText: 'Sign In to OpenWorkspace',
      buttonUrl: link,
      footnote: `If you did not request this link, you can safely ignore this email. Link URL: ${link}`,
    });

    return this.sendMail({
      to: email,
      subject,
      html,
      text: `Sign in to OpenWorkspace: ${link}`,
    });
  }

  async sendWorkspaceInvite(email: string, params: WorkspaceInviteParam) {
    const subject = `${params.username} invited you to ${params.workspaceName} in OpenWorkspace`;
    const html = this.renderEmailLayout({
      title: 'Workspace Invitation',
      greeting: 'Hello,',
      paragraphs: [
        `<strong>${params.username}</strong> has invited you to collaborate in the workspace <strong>"${params.workspaceName}"</strong> on OpenWorkspace.`,
        'Join your team to build, organize, and manage documents, databases, and projects together.',
      ],
      buttonText: 'Accept Invitation',
      buttonUrl: params.acceptUrl,
      footnote: `Accept URL: ${params.acceptUrl}`,
    });

    return this.sendMail({
      to: email,
      subject,
      html,
      text: `${params.username} invited you to ${params.workspaceName}: ${params.acceptUrl}`,
    });
  }

  async sendWorkspaceAccessRequest(recipientEmail: string, params: WorkspaceAccessRequestParam) {
    const subject = `${params.username} requested access to ${params.workspaceName} in OpenWorkspace`;
    const html = this.renderEmailLayout({
      title: 'Access Request',
      greeting: params.recipientName ? `Hello ${params.recipientName},` : 'Hello Workspace Admin,',
      paragraphs: [
        `User <strong>${params.username}</strong> has requested access to your workspace <strong>"${params.workspaceName}"</strong>.`,
        'Review and approve this access request to grant them membership.',
      ],
      buttonText: 'Review Access Request',
      buttonUrl: params.approveUrl,
      footnote: `Approve URL: ${params.approveUrl}`,
    });

    return this.sendMail({
      to: recipientEmail,
      subject,
      html,
      text: `${params.username} requested access to ${params.workspaceName}: ${params.approveUrl}`,
    });
  }

  async sendWorkspaceAccessRequestApproved(recipientEmail: string, params: WorkspaceAccessRequestApprovedMailerParam) {
    const subject = 'Notification: Workspace access request approved';
    const html = this.renderEmailLayout({
      title: 'Access Granted! 🎉',
      greeting: params.recipientName ? `Hello ${params.recipientName},` : 'Hello,',
      paragraphs: [
        `Great news! Your request to join the workspace <strong>"${params.workspaceName}"</strong> has been approved.`,
        'You can now access all shared pages, databases, and collaborative resources in this workspace.',
      ],
      buttonText: 'Open Workspace',
      buttonUrl: params.launchWorkspaceUrl,
      footnote: `Workspace URL: ${params.launchWorkspaceUrl}`,
    });

    return this.sendMail({
      to: recipientEmail,
      subject,
      html,
      text: `Your request to join ${params.workspaceName} has been approved: ${params.launchWorkspaceUrl}`,
    });
  }

  async sendPageMention(recipientEmail: string, params: PageMentionNotificationMailerParam) {
    const subject = `${params.mentionerName} has mentioned you in ${params.mentionedPageName} in OpenWorkspace`;
    const html = this.renderEmailLayout({
      title: 'New Mention',
      greeting: params.recipientName ? `Hello ${params.recipientName},` : 'Hello,',
      paragraphs: [
        `<strong>${params.mentionerName}</strong> mentioned you in the page <strong>"${params.mentionedPageName}"</strong> in workspace <strong>"${params.workspaceName}"</strong>.`,
      ],
      buttonText: 'View Mention',
      buttonUrl: params.mentionedPageUrl,
      footnote: `Page URL: ${params.mentionedPageUrl}`,
    });

    return this.sendMail({
      to: recipientEmail,
      subject,
      html,
      text: `${params.mentionerName} mentioned you in ${params.mentionedPageName}: ${params.mentionedPageUrl}`,
    });
  }

  async sendImportResult(recipientEmail: string, params: ImportNotionMailerParam) {
    const statusText = params.success ? 'completed successfully' : 'encountered issues';
    const subject = `Import ${params.importFileName} ${params.success ? 'Successful' : 'Failed'}`;
    const html = this.renderEmailLayout({
      title: params.success ? 'Import Completed 🎉' : 'Import Failed ⚠️',
      greeting: params.userName ? `Hello ${params.userName},` : 'Hello,',
      paragraphs: [
        `The data import of <strong>"${params.importFileName}"</strong> into workspace <strong>"${params.workspaceName}"</strong> ${statusText}.`,
        params.error ? `<div style="background:#fee2e2;color:#991b1b;padding:12px;border-radius:6px;font-family:monospace;">${params.error}</div>` : 'All documents and blocks have been imported and synchronized.',
      ],
      buttonText: 'Go to Workspace',
      buttonUrl: 'http://localhost:8000',
    });

    return this.sendMail({
      to: recipientEmail,
      subject,
      html,
      text: `Import of ${params.importFileName} into ${params.workspaceName} ${statusText}.`,
    });
  }

  private renderEmailLayout(options: {
    title: string;
    greeting: string;
    paragraphs: string[];
    buttonText?: string;
    buttonUrl?: string;
    footnote?: string;
  }): string {
    const buttonHtml = options.buttonText && options.buttonUrl
      ? `<div style="margin: 28px 0; text-align: center;">
          <a href="${options.buttonUrl}" style="background-color: #6366f1; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(99,102,241,0.2);">
            ${options.buttonText}
          </a>
        </div>`
      : '';

    const footnoteHtml = options.footnote
      ? `<p style="color: #9ca3af; font-size: 12px; margin-top: 24px; word-break: break-all;">${options.footnote}</p>`
      : '';

    const paragraphsHtml = options.paragraphs
      .map((p) => `<p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 12px 0;">${p}</p>`)
      .join('');

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${options.title}</title>
</head>
<body style="background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 40px 16px;">
  <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb;">
    <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px 24px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">OpenWorkspace</h1>
      <p style="color: #e0e7ff; margin: 6px 0 0 0; font-size: 14px;">Your open source Notion alternative</p>
    </div>
    <div style="padding: 32px 28px;">
      <h2 style="color: #111827; font-size: 20px; font-weight: 600; margin-top: 0; margin-bottom: 16px;">${options.title}</h2>
      <p style="color: #1f2937; font-size: 15px; font-weight: 500; margin-bottom: 12px;">${options.greeting}</p>
      ${paragraphsHtml}
      ${buttonHtml}
      ${footnoteHtml}
    </div>
    <div style="background-color: #f9fafb; border-top: 1px solid #e5e7eb; padding: 20px 24px; text-align: center;">
      <p style="color: #6b7280; font-size: 12px; margin: 0;">
        Sent with ❤️ by OpenWorkspace Cloud • Open-source collaborative workspace
      </p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }
}
