import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MatchesService } from './matches.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { PublishResultDto } from './dto/publish-result.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('matches')
@ApiBearerAuth()
@Controller()
export class MatchesController {
  constructor(private matchesService: MatchesService) {}

  @Get('tournaments/:tournamentId/matches')
  @ApiQuery({ name: 'group', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Param('tournamentId') tournamentId: string,
    @Query('group') group?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.matchesService.findAll(tournamentId, { group, status, search });
  }

  @Get('matches/:id')
  findOne(@Param('id') id: string) {
    return this.matchesService.findById(id);
  }

  @Post('matches')
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateMatchDto) {
    return this.matchesService.create(dto);
  }

  @Patch('matches/:id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateMatchDto) {
    return this.matchesService.update(id, dto);
  }

  @Delete('matches/:id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.matchesService.remove(id);
  }

  @Patch('matches/:id/result')
  @Roles(UserRole.ADMIN)
  publishResult(@Param('id') id: string, @Body() dto: PublishResultDto) {
    return this.matchesService.publishResult(id, dto);
  }

  @Patch('matches/:id/status')
  @Roles(UserRole.ADMIN)
  updateStatus(@Param('id') id: string, @Body() dto: UpdateMatchDto) {
    return this.matchesService.update(id, dto);
  }
}
