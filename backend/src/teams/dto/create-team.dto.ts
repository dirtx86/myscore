import { IsString, IsOptional, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTeamDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsString() @Length(3, 3) fifaCode: string;
  @ApiProperty() @IsString() @Length(2, 6) isoCode: string;
  @ApiPropertyOptional() @IsString() @Length(1, 1) @IsOptional() groupLabel?: string;
}
