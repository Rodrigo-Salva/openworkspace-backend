import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SendTestMailDto {
  @ApiProperty({ example: 'user@example.com', description: 'Recipient email address' })
  @IsEmail()
  @IsNotEmpty()
  to: string;

  @ApiProperty({ example: 'Welcome to AppFlowy', description: 'Email subject' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ example: 'Hello! This is a test email.', description: 'Plain text or HTML body', required: false })
  @IsString()
  @IsOptional()
  body?: string;
}

export class SendInviteMailDto {
  @ApiProperty({ example: 'colleague@example.com' })
  @IsEmail()
  @IsNotEmpty()
  to: string;

  @ApiProperty({ example: 'Alice' })
  @IsString()
  @IsNotEmpty()
  inviterName: string;

  @ApiProperty({ example: 'Product Engineering' })
  @IsString()
  @IsNotEmpty()
  workspaceName: string;

  @ApiProperty({ example: 'http://localhost:3000/invite/join?code=xyz123' })
  @IsString()
  @IsNotEmpty()
  acceptUrl: string;
}
