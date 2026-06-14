import { IsString, IsOptional, Length } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTeamDto {
  @ApiPropertyOptional() @IsString() @IsOptional() name?: string;
  @ApiPropertyOptional() @IsString() @Length(3, 3) @IsOptional() fifaCode?: string;
  @ApiPropertyOptional() @IsString() @Length(2, 6) @IsOptional() isoCode?: string;
  @ApiPropertyOptional() @IsString() @Length(1, 1) @IsOptional() groupLabel?: string;
}
