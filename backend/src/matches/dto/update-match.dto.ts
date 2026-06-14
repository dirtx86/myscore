import { IsUUID, IsDateString, IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { MatchStage, MatchStatus } from '../entities/match.entity';

export class UpdateMatchDto {
  @ApiPropertyOptional() @IsUUID() @IsOptional() homeTeamId?: string;
  @ApiPropertyOptional() @IsUUID() @IsOptional() awayTeamId?: string;
  @ApiPropertyOptional() @IsDateString() @IsOptional() kickoffAt?: string;
  @ApiPropertyOptional({ enum: MatchStage }) @IsEnum(MatchStage) @IsOptional() stage?: MatchStage;
  @ApiPropertyOptional() @IsString() @Length(1, 1) @IsOptional() groupLabel?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() venue?: string;
  @ApiPropertyOptional({ enum: MatchStatus }) @IsEnum(MatchStatus) @IsOptional() status?: MatchStatus;
}
