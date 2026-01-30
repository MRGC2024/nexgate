import { MigrationInterface, QueryRunner } from 'typeorm';

export class MerchantAddress1738200000002 implements MigrationInterface {
  name = 'MerchantAddress1738200000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "merchants"
      ADD COLUMN IF NOT EXISTS "address" text
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "merchants" DROP COLUMN IF EXISTS "address"
    `);
  }
}
