import { MigrationInterface, QueryRunner } from 'typeorm';

export class MerchantWithdrawalAndAcquirer1738200000003 implements MigrationInterface {
  name = 'MerchantWithdrawalAndAcquirer1738200000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "merchants"
      ADD COLUMN IF NOT EXISTS "withdrawalLimitCents" integer,
      ADD COLUMN IF NOT EXISTS "withdrawalFeePercent" decimal(5,2) NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "withdrawalFeeFixedCents" integer NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "acquirerCode" character varying(64),
      ADD COLUMN IF NOT EXISTS "pixWithdrawalKey" character varying(256)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "merchants"
      DROP COLUMN IF EXISTS "withdrawalLimitCents",
      DROP COLUMN IF EXISTS "withdrawalFeePercent",
      DROP COLUMN IF EXISTS "withdrawalFeeFixedCents",
      DROP COLUMN IF EXISTS "acquirerCode",
      DROP COLUMN IF EXISTS "pixWithdrawalKey"
    `);
  }
}
