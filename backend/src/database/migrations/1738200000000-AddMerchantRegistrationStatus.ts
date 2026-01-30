import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMerchantRegistrationStatus1738200000000 implements MigrationInterface {
  name = 'AddMerchantRegistrationStatus1738200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "merchants"
      ADD COLUMN IF NOT EXISTS "registrationStatus" character varying(32) NOT NULL DEFAULT 'approved'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "merchants" DROP COLUMN IF EXISTS "registrationStatus"
    `);
  }
}
