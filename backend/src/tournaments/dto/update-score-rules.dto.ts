import { IsInt, Min, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateScoreRulesDto {
  @ApiPropertyOptional({ default: 1 })
  @IsInt() @Min(0) @IsOptional()
  totoPts?: number;

  @ApiPropertyOptional({ default: 3 })
  @IsInt() @Min(0) @IsOptional()
  fullScorePts?: number;

  @ApiPropertyOptional({ default: 1 })
  @IsInt() @Min(0) @IsOptional()
  goalDiffPts?: number;

  @ApiPropertyOptional({ default: 15 })
  @IsInt() @Min(0) @IsOptional()
  lockMinutes?: number;
}
