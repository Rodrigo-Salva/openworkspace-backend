import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AdminCreateUserDto {
  @ApiProperty({ example: 'usuario@empresa.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'passwordSegura123' })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiPropertyOptional({ example: 'Juan Pérez' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  email_confirm?: boolean;
}

export class AdminUpdateUserDto {
  @ApiPropertyOptional({ example: 'usuario.nuevo@empresa.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'NuevaPassword123' })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional({ example: 'Juan Carlos Pérez' })
  @IsOptional()
  @IsString()
  name?: string;
}

export class AdminCreateSSOProviderDto {
  @ApiProperty({ example: 'saml' })
  @IsNotEmpty()
  @IsString()
  type: string;

  @ApiProperty({ example: 'https://idp.ejemplo.com/metadata.xml' })
  @IsNotEmpty()
  @IsString()
  metadata_url: string;
}
