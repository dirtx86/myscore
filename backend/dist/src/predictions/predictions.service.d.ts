import { Repository } from 'typeorm';
import { Prediction } from './entities/prediction.entity';
import { MatchesService } from '../matches/matches.service';
import { TournamentsService } from '../tournaments/tournaments.service';
import { CreatePredictionDto } from './dto/create-prediction.dto';
import { UpdatePredictionDto } from './dto/update-prediction.dto';
export declare class PredictionsService {
    private predRepo;
    private matchesService;
    private tournamentsService;
    constructor(predRepo: Repository<Prediction>, matchesService: MatchesService, tournamentsService: TournamentsService);
    findMyPredictions(userId: string, tournamentId: string): Promise<Prediction[]>;
    create(userId: string, dto: CreatePredictionDto): Promise<Prediction>;
    update(userId: string, predId: string, dto: UpdatePredictionDto): Promise<Prediction>;
    findByMatchId(matchId: string): Promise<Prediction[]>;
}
