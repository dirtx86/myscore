import { IsBoolean, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateStreamDto {
  @ApiPropertyOptional()
  @IsUrl({ require_protocol: true })
  @IsOptional()
  url?: string | null;

  @ApiProperty()
  @IsBoolean()
  published: boolean;
}
