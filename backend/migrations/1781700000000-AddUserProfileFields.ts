import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserProfileFields1781700000000 implements MigrationInterface {
  name = 'AddUserProfileFields1781700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "nickname" character varying`);
    await queryRunner.query(`ALTER TABLE "users" ADD "bio" character varying(160)`);
    await queryRunner.query(`ALTER TABLE "users" ADD "department" character varying`);
    await queryRunner.query(`ALTER TABLE "users" ADD "favouriteTeamId" uuid`);
    await queryRunner.query(`ALTER TABLE "users" ADD "avatarPath" character varying`);
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD CONSTRAINT "FK_users_favouriteTeam"
      FOREIGN KEY ("favouriteTeamId") REFERENCES "teams"("id") ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_users_favouriteTeam"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "avatarPath"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "favouriteTeamId"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "department"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "bio"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "nickname"`);
  }
}
