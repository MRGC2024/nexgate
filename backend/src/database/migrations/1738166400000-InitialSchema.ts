import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1738166400000 implements MigrationInterface {
  name = 'InitialSchema1738166400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TABLE "merchants" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "slug" character varying NOT NULL,
        "name" character varying NOT NULL,
        "document" character varying,
        "email" character varying,
        "phone" character varying,
        "accentColor" character varying NOT NULL DEFAULT '#2563eb',
        "active" boolean NOT NULL DEFAULT true,
        "tags" text,
        "metadata" jsonb,
        "ipAllowlist" inet array,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_merchants_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_merchants" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "connector_definitions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "code" character varying NOT NULL,
        "name" character varying NOT NULL,
        "version" character varying,
        "supportedMethods" text NOT NULL,
        "configSchema" jsonb,
        "webhookRoutes" text,
        "enabled" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_connector_definitions_code" UNIQUE ("code"),
        CONSTRAINT "PK_connector_definitions" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "roles" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" character varying,
        CONSTRAINT "UQ_roles_name" UNIQUE ("name"),
        CONSTRAINT "PK_roles" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "permissions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "code" character varying NOT NULL,
        "description" character varying,
        CONSTRAINT "UQ_permissions_code" UNIQUE ("code"),
        CONSTRAINT "PK_permissions" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "role_permissions" (
        "roleId" uuid NOT NULL,
        "permissionId" uuid NOT NULL,
        CONSTRAINT "PK_role_permissions" PRIMARY KEY ("roleId", "permissionId")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "merchantId" uuid,
        "email" character varying NOT NULL,
        "passwordHash" character varying NOT NULL,
        "name" character varying NOT NULL,
        "active" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id"),
        CONSTRAINT "FK_users_merchant" FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "user_roles" (
        "userId" uuid NOT NULL,
        "roleId" uuid NOT NULL,
        CONSTRAINT "PK_user_roles" PRIMARY KEY ("userId", "roleId")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "api_keys" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "merchantId" uuid NOT NULL,
        "publicKey" character varying NOT NULL,
        "secretKeyHash" character varying NOT NULL,
        "name" character varying,
        "active" boolean NOT NULL DEFAULT true,
        "lastUsedAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_api_keys_publicKey" UNIQUE ("publicKey"),
        CONSTRAINT "PK_api_keys" PRIMARY KEY ("id"),
        CONSTRAINT "FK_api_keys_merchant" FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "merchant_connectors" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "merchantId" uuid NOT NULL,
        "connectorDefinitionId" uuid NOT NULL,
        "encryptedConfig" text NOT NULL,
        "active" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_merchant_connectors" PRIMARY KEY ("id"),
        CONSTRAINT "FK_merchant_connectors_merchant" FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_merchant_connectors_connector" FOREIGN KEY ("connectorDefinitionId") REFERENCES "connector_definitions"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "routing_rules" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "merchantId" uuid NOT NULL,
        "connectorDefinitionId" uuid NOT NULL,
        "paymentMethod" character varying NOT NULL,
        "amountMinCents" integer,
        "amountMaxCents" integer,
        "currency" character varying,
        "priority" integer NOT NULL DEFAULT 0,
        "isFallback" boolean NOT NULL DEFAULT false,
        "merchantTags" text,
        "active" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_routing_rules" PRIMARY KEY ("id"),
        CONSTRAINT "FK_routing_rules_merchant" FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_routing_rules_connector" FOREIGN KEY ("connectorDefinitionId") REFERENCES "connector_definitions"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "transactions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "merchantId" uuid NOT NULL,
        "amountCents" integer NOT NULL,
        "currency" character varying NOT NULL DEFAULT 'BRL',
        "paymentMethod" character varying NOT NULL,
        "status" character varying NOT NULL DEFAULT 'created',
        "externalRef" character varying NOT NULL,
        "customer" jsonb,
        "items" jsonb NOT NULL DEFAULT '[]',
        "providerCode" character varying,
        "providerTransactionId" character varying,
        "pixQr" character varying,
        "pixCopyPaste" text,
        "expiresAt" TIMESTAMP,
        "boletoUrl" character varying,
        "boletoLine" character varying,
        "cardLast4" character varying,
        "cardBrand" character varying,
        "installments" integer,
        "metadata" jsonb,
        "paidAt" TIMESTAMP,
        "canceledAt" TIMESTAMP,
        "refundedAt" TIMESTAMP,
        "idempotencyKey" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_transactions" PRIMARY KEY ("id"),
        CONSTRAINT "FK_transactions_merchant" FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transactions_merchant_status" ON "transactions" ("merchantId", "status")
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_transactions_idempotency" ON "transactions" ("merchantId", "idempotencyKey") WHERE "idempotencyKey" IS NOT NULL
    `);

    await queryRunner.query(`
      CREATE TABLE "transaction_events" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "transactionId" uuid NOT NULL,
        "event" character varying NOT NULL,
        "payload" jsonb,
        "source" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_transaction_events" PRIMARY KEY ("id"),
        CONSTRAINT "FK_transaction_events_transaction" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "webhook_endpoints" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "merchantId" uuid NOT NULL,
        "url" character varying NOT NULL,
        "events" text NOT NULL,
        "active" boolean NOT NULL DEFAULT true,
        "description" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_webhook_endpoints" PRIMARY KEY ("id"),
        CONSTRAINT "FK_webhook_endpoints_merchant" FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "webhook_deliveries" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "webhookEndpointId" uuid NOT NULL,
        "eventId" character varying NOT NULL,
        "event" character varying NOT NULL,
        "requestBody" text,
        "attempt" integer NOT NULL DEFAULT 0,
        "statusCode" integer NOT NULL DEFAULT 0,
        "responseBody" text,
        "errorMessage" text,
        "status" character varying NOT NULL DEFAULT 'pending',
        "nextRetryAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_webhook_deliveries" PRIMARY KEY ("id"),
        CONSTRAINT "FK_webhook_deliveries_endpoint" FOREIGN KEY ("webhookEndpointId") REFERENCES "webhook_endpoints"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "audit_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid,
        "merchantId" uuid,
        "action" character varying NOT NULL,
        "resource" character varying,
        "resourceId" character varying,
        "metadata" jsonb,
        "ip" inet,
        "userAgent" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_audit_logs" PRIMARY KEY ("id"),
        CONSTRAINT "FK_audit_logs_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_audit_logs_merchant" FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "provider_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "merchantId" uuid,
        "providerCode" character varying NOT NULL,
        "direction" character varying NOT NULL,
        "bodyMasked" text,
        "transactionId" character varying,
        "statusCode" integer,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_provider_logs" PRIMARY KEY ("id"),
        CONSTRAINT "FK_provider_logs_merchant" FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_role_permissions_role" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_role_permissions_permission" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE "user_roles" ADD CONSTRAINT "FK_user_roles_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE "user_roles" ADD CONSTRAINT "FK_user_roles_role" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_user_roles_role"`);
    await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_user_roles_user"`);
    await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_role_permissions_permission"`);
    await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_role_permissions_role"`);
    await queryRunner.query(`DROP TABLE "provider_logs"`);
    await queryRunner.query(`DROP TABLE "audit_logs"`);
    await queryRunner.query(`DROP TABLE "webhook_deliveries"`);
    await queryRunner.query(`DROP TABLE "webhook_endpoints"`);
    await queryRunner.query(`DROP TABLE "transaction_events"`);
    await queryRunner.query(`DROP TABLE "transactions"`);
    await queryRunner.query(`DROP TABLE "routing_rules"`);
    await queryRunner.query(`DROP TABLE "merchant_connectors"`);
    await queryRunner.query(`DROP TABLE "api_keys"`);
    await queryRunner.query(`DROP TABLE "user_roles"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "role_permissions"`);
    await queryRunner.query(`DROP TABLE "permissions"`);
    await queryRunner.query(`DROP TABLE "roles"`);
    await queryRunner.query(`DROP TABLE "connector_definitions"`);
    await queryRunner.query(`DROP TABLE "merchants"`);
  }
}
