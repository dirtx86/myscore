import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GeneratePasswordDto {
  @ApiProperty({ example: 'user@company.com' })
  @IsEmail()
  email: string;
}
