import { IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PublishResultDto {
  @ApiProperty({ description: 'Home score (AET for knockouts, excludes penalties)' })
  @IsInt() @Min(0) @Max(30)
  homeScore: number;

  @ApiProperty({ description: 'Away score (AET for knockouts, excludes penalties)' })
  @IsInt() @Min(0) @Max(30)
  awayScore: number;
}
