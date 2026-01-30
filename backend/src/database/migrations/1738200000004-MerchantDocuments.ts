import { MigrationInterface, QueryRunner } from 'typeorm';

export class MerchantDocuments1738200000004 implements MigrationInterface {
  name = 'MerchantDocuments1738200000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "merchant_documents" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "merchantId" uuid NOT NULL,
        "documentType" character varying(64) NOT NULL,
        "fileUrl" character varying(512) NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_merchant_documents" PRIMARY KEY ("id"),
        CONSTRAINT "FK_merchant_documents_merchant" FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "merchant_documents"`);
  }
}
