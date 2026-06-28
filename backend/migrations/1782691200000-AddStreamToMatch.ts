import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStreamToMatch1782691200000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "matches"
        ADD COLUMN IF NOT EXISTS "streamUrl" varchar NULL,
        ADD COLUMN IF NOT EXISTS "streamPublished" boolean NOT NULL DEFAULT false
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "matches"
        DROP COLUMN IF EXISTS "streamPublished",
        DROP COLUMN IF EXISTS "streamUrl"
    `);
  }
}
