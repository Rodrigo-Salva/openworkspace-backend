import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class SearchDocumentQueryDto {
  @ApiProperty({ example: 'proyecto' })
  @IsNotEmpty()
  @IsString()
  keyword: string;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  limit?: number;
}

export class SummarySearchQueryDto {
  @ApiProperty({ example: 'proyecto' })
  @IsNotEmpty()
  @IsString()
  query: string;
}
