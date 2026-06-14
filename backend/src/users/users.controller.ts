import {
  Controller, Get, Post, Param, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from './entities/user.entity';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  getMe(@CurrentUser() user: any) {
    return this.usersService.findById(user.id);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.usersService.findAll();
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
