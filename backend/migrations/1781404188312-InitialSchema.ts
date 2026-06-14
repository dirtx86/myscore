import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1781404188312 implements MigrationInterface {
    name = 'InitialSchema1781404188312'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "teams" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tournamentId" uuid NOT NULL, "name" character varying NOT NULL, "fifaCode" character varying(3) NOT NULL, "isoCode" character varying(6) NOT NULL, "groupLabel" character varying(1), CONSTRAINT "PK_7e5523774a38b08a6236d322403" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "score_rules" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tournamentId" uuid NOT NULL, "totoPts" integer NOT NULL DEFAULT '1', "fullScorePts" integer NOT NULL DEFAULT '3', "goalDiffPts" integer NOT NULL DEFAULT '1', CONSTRAINT "REL_11b3c3747a8aa21da7546318c9" UNIQUE ("tournamentId"), CONSTRAINT "PK_b7968cc11dcdaa5f2de8a3eef83" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "leaderboard_entries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tournamentId" uuid NOT NULL, "userId" uuid NOT NULL, "totalPts" integer NOT NULL DEFAULT '0', "fullCount" integer NOT NULL DEFAULT '0', "totoCount" integer NOT NULL DEFAULT '0', "goalDiffCount" integer NOT NULL DEFAULT '0', "playedCount" integer NOT NULL DEFAULT '0', CONSTRAINT "UQ_99ca11e3c1be7d64341f761da5d" UNIQUE ("tournamentId", "userId"), CONSTRAINT "PK_a3187f7d37819756a5519336665" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tournaments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "year" integer NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "lockMinutes" integer NOT NULL DEFAULT '15', CONSTRAINT "PK_6d5d129da7a80cf99e8ad4833a9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."matches_stage_enum" AS ENUM('group', 'r32', 'r16', 'qf', 'sf', 'third_place', 'final')`);
        await queryRunner.query(`CREATE TYPE "public"."matches_status_enum" AS ENUM('scheduled', 'locked', 'live', 'completed')`);
        await queryRunner.query(`CREATE TABLE "matches" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tournamentId" uuid NOT NULL, "homeTeamId" uuid NOT NULL, "awayTeamId" uuid NOT NULL, "kickoffAt" TIMESTAMP WITH TIME ZONE NOT NULL, "stage" "public"."matches_stage_enum" NOT NULL, "groupLabel" character varying(1), "venue" character varying, "status" "public"."matches_status_enum" NOT NULL DEFAULT 'scheduled', "homeScore" integer, "awayScore" integer, CONSTRAINT "PK_8a22c7b2e0828988d51256117f4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "predictions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "matchId" uuid NOT NULL, "homeScore" integer NOT NULL, "awayScore" integer NOT NULL, "pointsEarned" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_c09145f7b21fffaa605488d5ad2" UNIQUE ("userId", "matchId"), CONSTRAINT "PK_b92c9e4db595214b289f5e28adc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('user', 'admin')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "passwordHash" character varying NOT NULL, "displayName" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'user', "isActive" boolean NOT NULL DEFAULT true, "mustChangePassword" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "teams" ADD CONSTRAINT "FK_f09b3fd06a61a5c842d3a8e0dee" FOREIGN KEY ("tournamentId") REFERENCES "tournaments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "score_rules" ADD CONSTRAINT "FK_11b3c3747a8aa21da7546318c97" FOREIGN KEY ("tournamentId") REFERENCES "tournaments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "leaderboard_entries" ADD CONSTRAINT "FK_e6b34a2df3afb041d66ad76d31f" FOREIGN KEY ("tournamentId") REFERENCES "tournaments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "leaderboard_entries" ADD CONSTRAINT "FK_e0e0d8d4021f8b3dc45d98d67c0" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "matches" ADD CONSTRAINT "FK_bb8efa7b9b9f386cfe3626b6bec" FOREIGN KEY ("tournamentId") REFERENCES "tournaments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "matches" ADD CONSTRAINT "FK_999a74ecaebaf96816112445a09" FOREIGN KEY ("homeTeamId") REFERENCES "teams"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "matches" ADD CONSTRAINT "FK_c5505de389fa5fca7ddce29fa49" FOREIGN KEY ("awayTeamId") REFERENCES "teams"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "predictions" ADD CONSTRAINT "FK_cd3302a5d7d146da1e001ace2bd" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "predictions" ADD CONSTRAINT "FK_3458aa50ebcc2f3df1d720161a3" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "predictions" DROP CONSTRAINT "FK_3458aa50ebcc2f3df1d720161a3"`);
        await queryRunner.query(`ALTER TABLE "predictions" DROP CONSTRAINT "FK_cd3302a5d7d146da1e001ace2bd"`);
        await queryRunner.query(`ALTER TABLE "matches" DROP CONSTRAINT "FK_c5505de389fa5fca7ddce29fa49"`);
        await queryRunner.query(`ALTER TABLE "matches" DROP CONSTRAINT "FK_999a74ecaebaf96816112445a09"`);
        await queryRunner.query(`ALTER TABLE "matches" DROP CONSTRAINT "FK_bb8efa7b9b9f386cfe3626b6bec"`);
        await queryRunner.query(`ALTER TABLE "leaderboard_entries" DROP CONSTRAINT "FK_e0e0d8d4021f8b3dc45d98d67c0"`);
        await queryRunner.query(`ALTER TABLE "leaderboard_entries" DROP CONSTRAINT "FK_e6b34a2df3afb041d66ad76d31f"`);
        await queryRunner.query(`ALTER TABLE "score_rules" DROP CONSTRAINT "FK_11b3c3747a8aa21da7546318c97"`);
        await queryRunner.query(`ALTER TABLE "teams" DROP CONSTRAINT "FK_f09b3fd06a61a5c842d3a8e0dee"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TABLE "predictions"`);
        await queryRunner.query(`DROP TABLE "matches"`);
        await queryRunner.query(`DROP TYPE "public"."matches_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."matches_stage_enum"`);
        await queryRunner.query(`DROP TABLE "tournaments"`);
        await queryRunner.query(`DROP TABLE "leaderboard_entries"`);
        await queryRunner.query(`DROP TABLE "score_rules"`);
        await queryRunner.query(`DROP TABLE "teams"`);
    }

}
