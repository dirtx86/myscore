import {
  Controller, Get, Post, Patch, Param, Body, HttpCode, HttpStatus,
  UseInterceptors, UploadedFile, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { join } from 'path';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from './entities/user.entity';

import { diskStorage } from 'multer';

const UPLOADS_DIR = join(process.cwd(), 'uploads', 'avatars');

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  getMe(@CurrentUser() user: any) {
    return this.usersService.findById(user.id);
  }

  @Patch('me/profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update own profile fields' })
  updateProfile(@CurrentUser() user: any, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Post('me/avatar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Upload profile avatar' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('avatar', {
    storage: diskStorage({
      destination: UPLOADS_DIR,
      filename: (req: any, _file: any, cb: any) => {
        if (!req.user?.id) return cb(new Error('Unauthenticated'), false);
        cb(null, `${req.user.id}.jpg`);
      },
    }),
    fileFilter: (_req: any, file: any, cb: any) => {
      if (file.mimetype !== 'image/jpeg') {
        return cb(new BadRequestException('Only JPEG images are allowed'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 2 * 1024 * 1024 },
  }))
  async uploadAvatar(@CurrentUser() user: any, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    const avatarPath = `avatars/${user.id}.jpg`;
    return this.usersService.updateAvatar(user.id, avatarPath);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  @Patch(':id/role')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  setRole(@Param('id') id: string, @Body('role') role: UserRole) {
    return this.usersService.setRole(id, role);
  }

  @Post(':id/disable')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  disable(@Param('id') id: string) {
    return this.usersService.setActive(id, false);
  }

  @Post(':id/enable')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  enable(@Param('id') id: string) {
    return this.usersService.setActive(id, true);
  }

  @Post(':id/reset-password')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin force-reset user password, returns new password' })
  resetPassword(@Param('id') id: string) {
    return this.usersService.forceResetPassword(id);
  }
}
