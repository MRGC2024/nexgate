import { MigrationInterface, QueryRunner } from 'typeorm';

export class FeeConfig1738200000001 implements MigrationInterface {
  name = 'FeeConfig1738200000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "fee_config" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "scope" character varying NOT NULL DEFAULT 'global',
        "merchantId" uuid,
        "config" jsonb NOT NULL DEFAULT '{}',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_fee_config" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      INSERT INTO "fee_config" ("id", "scope", "config", "createdAt", "updatedAt")
      VALUES (
        uuid_generate_v4(),
        'global',
        '{"pixPercent":3.99,"pixFixedCents":199,"withdrawalFeeCents":0,"withdrawalPercent":0,"boletoPercent":6.99,"boletoFixedCents":299,"cardPercent":7.99,"cardFixedCents":299}',
        now(),
        now()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "fee_config"`);
  }
}
