import { Tournament } from '../../tournaments/entities/tournament.entity';
export declare class Team {
    id: string;
    tournament: Tournament;
    tournamentId: string;
    name: string;
    fifaCode: string;
    isoCode: string;
    groupLabel: string;
}
