import { IsUUID, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePredictionDto {
  @ApiProperty() @IsUUID() matchId: string;
  @ApiProperty() @IsInt() @Min(0) @Max(30) homeScore: number;
  @ApiProperty() @IsInt() @Min(0) @Max(30) awayScore: number;
}
