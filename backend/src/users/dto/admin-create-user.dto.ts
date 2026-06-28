import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class AdminCreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(2)
  @MaxLength(60)
  displayName: string;
}
