import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGoogleAuth1781500000000 implements MigrationInterface {
    name = 'AddGoogleAuth1781500000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "googleId" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_users_googleId" UNIQUE ("googleId")`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "passwordHash" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "passwordHash" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_users_googleId"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "googleId"`);
    }
}
