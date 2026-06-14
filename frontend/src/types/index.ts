// frontend/src/types/index.ts

// ── Primitives ──────────────────────────────────────────────────────────────

export type UserRole = 'user' | 'admin';
export type MatchStage =
  | 'group'
  | 'r32'
  | 'r16'
  | 'qf'
  | 'sf'
  | 'third_place'
  | 'final';
export type MatchStatus = 'scheduled' | 'locked' | 'live' | 'completed';

// ── Domain entities ─────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  isActive: boolean;
  mustChangePassword: boolean;
  createdAt: string;
}

export interface AuthTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  displayName: string;
}

export interface Tournament {
  id: string;
  name: string;
  year: number;
  isActive: boolean;
  lockMinutes: number;
}

export interface Team {
  id: string;
  tournamentId: string;
  name: string;
  fifaCode: string;
  isoCode: string;
  groupLabel: string;
}

export interface Match {
  id: string;
  tournamentId: string;
  homeTeam: Team;
  awayTeam: Team;
  kickoffAt: string;
  stage: MatchStage;
  groupLabel?: string;
  venue?: string;
  status: MatchStatus;
  homeScore?: number;
  awayScore?: number;
}

export interface Prediction {
  id: string;
  userId: string;
  matchId: string;
  homeScore: number;
  awayScore: number;
  pointsEarned?: number;
  createdAt: string;
  updatedAt: string;
  match?: Match;
}

export interface LeaderboardEntry {
  userId: string;
  tournamentId: string;
  user: User;
  totalPts: number;
  fullCount: number;
  totoCount: number;
  goalDiffCount: number;
  playedCount: number;
  rank: number;
  prevRank?: number;
}

export interface ScoreRules {
  id: string;
  tournamentId: string;
  totoPts: number;
  fullScorePts: number;
  goalDiffPts: number;
}

export interface Stats {
  mostExact: { user: User; count: number } | null;
  mostPredictions: { user: User; count: number } | null;
  consensusByMatch: Array<{
    match: Match;
    homePercent: number;
    drawPercent: number;
    awayPercent: number;
  }>;
  pointsByRound: Array<{ stage: string; avgPts: number }>;
}

export interface ApiError {
  statusCode: number;
  error: string;
  message: string;
}

// ── Request / Response DTOs ─────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
}

export interface RegisterRequest {
  displayName: string;
  email: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface GeneratePasswordRequest {
  email: string;
}

export interface GeneratePasswordResponse {
  password: string;
}

export interface CreatePredictionRequest {
  matchId: string;
  homeScore: number;
  awayScore: number;
}

export interface UpdatePredictionRequest {
  homeScore: number;
  awayScore: number;
}

export interface MatchResultRequest {
  homeScore: number;
  awayScore: number;
}

export interface CreateMatchRequest {
  tournamentId: string;
  homeTeamId: string;
  awayTeamId: string;
  kickoffAt: string;
  stage: MatchStage;
  groupLabel?: string;
  venue?: string;
}

export interface CreateTeamRequest {
  tournamentId: string;
  name: string;
  fifaCode: string;
  isoCode: string;
  groupLabel: string;
}
