import { IsOptional, IsString, MaxLength, IsUUID, ValidateIf } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(30)
  nickname?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  bio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  department?: string;

  @ValidateIf((o) => o.favouriteTeamId !== null)
  @IsOptional()
  @IsUUID()
  favouriteTeamId?: string | null;
}
