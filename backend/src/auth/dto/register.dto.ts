import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Alex Rivera' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  displayName: string;

  @ApiProperty({ example: 'alex@company.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'mysecretpassword' })
  @IsString()
  @MinLength(8)
  password: string;
}
