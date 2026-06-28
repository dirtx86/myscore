import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddByAdminToPrediction1782604800000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "predictions" ADD COLUMN IF NOT EXISTS "byAdmin" boolean NOT NULL DEFAULT false`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "predictions" DROP COLUMN IF EXISTS "byAdmin"`,
    );
  }
}
