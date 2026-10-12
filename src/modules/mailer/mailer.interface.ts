export interface SendMailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

export interface WorkspaceInviteParam {
  username: string; // Inviter name
  workspaceName: string;
  userIconUrl?: string;
  workspaceIconUrl?: string;
  workspaceMemberCount?: number | string;
  acceptUrl: string;
}

export interface WorkspaceAccessRequestParam {
  recipientName?: string;
  username: string; // Requester name
  workspaceName: string;
  workspaceIconUrl?: string;
  workspaceMemberCount?: number | string;
  approveUrl: string;
}

export interface WorkspaceAccessRequestApprovedMailerParam {
  recipientName?: string;
  workspaceName: string;
  workspaceIconUrl?: string;
  workspaceMemberCount?: number | string;
  launchWorkspaceUrl: string;
}

export interface PageMentionNotificationMailerParam {
  recipientName?: string;
  workspaceName: string;
  mentionedPageName: string;
  mentionerName: string;
  mentionerIconUrl?: string;
  mentionedPageUrl: string;
  mentionedAt?: string;
}

export interface ImportNotionMailerParam {
  userName?: string;
  importFileName: string;
  workspaceName: string;
  success: boolean;
  error?: string;
}

export interface MagicLinkParam {
  email: string;
  magicLinkUrl: string;
}
