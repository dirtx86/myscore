import { PredictionsService } from './predictions.service';
import { CreatePredictionDto } from './dto/create-prediction.dto';
import { UpdatePredictionDto } from './dto/update-prediction.dto';
export declare class PredictionsController {
    private predictionsService;
    constructor(predictionsService: PredictionsService);
    getMyPredictions(user: any, tournamentId: string): Promise<import("./entities/prediction.entity").Prediction[]>;
    create(user: any, dto: CreatePredictionDto): Promise<import("./entities/prediction.entity").Prediction>;
    update(user: any, id: string, dto: UpdatePredictionDto): Promise<import("./entities/prediction.entity").Prediction>;
}
