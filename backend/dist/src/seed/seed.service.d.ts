import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Tournament } from '../tournaments/entities/tournament.entity';
import { ScoreRule } from '../tournaments/entities/score-rule.entity';
import { Team } from '../teams/entities/team.entity';
import { User } from '../users/entities/user.entity';
export declare class SeedService implements OnModuleInit {
    private tournamentRepo;
    private scoreRuleRepo;
    private teamRepo;
    private userRepo;
    private readonly logger;
    constructor(tournamentRepo: Repository<Tournament>, scoreRuleRepo: Repository<ScoreRule>, teamRepo: Repository<Team>, userRepo: Repository<User>);
    onModuleInit(): Promise<void>;
    seed(): Promise<void>;
}
