import { MigrationInterface, QueryRunner } from 'typeorm';

export class MerchantDocumentFileUrlText1738200000005 implements MigrationInterface {
  name = 'MerchantDocumentFileUrlText1738200000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "merchant_documents" ALTER COLUMN "fileUrl" TYPE text
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "merchant_documents" ALTER COLUMN "fileUrl" TYPE character varying(512)
    `);
  }
}
