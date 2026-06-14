import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('teams')
@ApiBearerAuth()
@Controller()
export class TeamsController {
  constructor(private teamsService: TeamsService) {}

  @Get('tournaments/:tournamentId/teams')
  findAll(@Param('tournamentId') tournamentId: string) {
    return this.teamsService.findAll(tournamentId);
  }

  @Post('teams')
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateTeamDto & { tournamentId: string }) {
    return this.teamsService.create(dto.tournamentId, dto);
  }

  @Patch('teams/:id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateTeamDto) {
    return this.teamsService.update(id, dto);
  }

  @Delete('teams/:id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.teamsService.remove(id);
  }
}
