import { IsInt, Min, Max, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePredictionDto {
  @ApiPropertyOptional() @IsInt() @Min(0) @Max(30) @IsOptional() homeScore?: number;
  @ApiPropertyOptional() @IsInt() @Min(0) @Max(30) @IsOptional() awayScore?: number;
}
