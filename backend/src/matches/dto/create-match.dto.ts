import { IsUUID, IsDateString, IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MatchStage } from '../entities/match.entity';

export class CreateMatchDto {
  @ApiProperty() @IsUUID() tournamentId: string;
  @ApiProperty() @IsUUID() homeTeamId: string;
  @ApiProperty() @IsUUID() awayTeamId: string;
  @ApiProperty() @IsDateString() kickoffAt: string;
  @ApiProperty({ enum: MatchStage }) @IsEnum(MatchStage) stage: MatchStage;
  @ApiPropertyOptional() @IsString() @Length(1, 1) @IsOptional() groupLabel?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() venue?: string;
}
