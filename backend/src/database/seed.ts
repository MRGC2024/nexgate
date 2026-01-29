/**
 * NEXGATE Seed - Cria roles, permissions, connector definitions, superadmin, merchant e API key
 * Uso: npm run seed
 */
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { dataSourceOptions } from './data-source';
import { Merchant } from '../modules/merchants/entities/merchant.entity';
import { User } from '../modules/users/entities/user.entity';
import { Role } from '../modules/users/entities/role.entity';
import { Permission } from '../modules/users/entities/permission.entity';
import { ConnectorDefinition } from '../modules/connectors/entities/connector-definition.entity';
import { ApiKey } from '../modules/api-keys/entities/api-key.entity';
import { MerchantConnector } from '../modules/connectors/entities/merchant-connector.entity';
import { RoutingRule } from '../modules/routing/entities/routing-rule.entity';
import * as crypto from 'crypto';
import { EncryptionService } from '../modules/connectors/encryption.service';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';

async function run() {
  const config = new ConfigService();
  const encryption = new EncryptionService(config);

  // Carregar todas as entidades (glob) para evitar erro de metadata (Merchant#transactions etc.)
  const ds = new DataSource({
    ...dataSourceOptions,
    entities: [path.join(__dirname, '../**/*.entity{.ts,.js}')],
  });
  await ds.initialize();

  const roleRepo = ds.getRepository(Role);
  const permRepo = ds.getRepository(Permission);
  const userRepo = ds.getRepository(User);
  const merchantRepo = ds.getRepository(Merchant);
  const defRepo = ds.getRepository(ConnectorDefinition);
  const apiKeyRepo = ds.getRepository(ApiKey);
  const mcRepo = ds.getRepository(MerchantConnector);
  const ruleRepo = ds.getRepository(RoutingRule);

  const permissions = await permRepo.find();
  const existingAdmin = await userRepo.findOne({ where: { email: 'admin@nexgate.local' } });
  if (permissions.length > 0 && existingAdmin) {
    console.log('Seed já aplicado (permissions e usuários existem).');
    await ds.destroy();
    return;
  }

  // Se permissions existem mas usuários não (ex.: seed falhou no meio), cria só os usuários de demo
  if (permissions.length > 0 && !existingAdmin) {
    console.log('Permissões existem; criando usuários de demo...');
    const superadminRole = await roleRepo.findOne({ where: { name: 'superadmin' } });
    const merchantAdminRoleFound = await roleRepo.findOne({ where: { name: 'merchant_admin' } });
    if (!superadminRole || !merchantAdminRoleFound) throw new Error('Roles não encontradas. Rode migrações e seed do zero.');
    let merchant = await merchantRepo.findOne({ where: { slug: 'demo' } });
    if (!merchant) {
      merchant = merchantRepo.create({
        slug: 'demo',
        name: 'Merchant Demo',
        document: '00000000000191',
        email: 'demo@nexgate.local',
        active: true,
        accentColor: '#2563eb',
      });
      await merchantRepo.save(merchant);
    }
    const superadminUser = userRepo.create({
      email: 'admin@nexgate.local',
      passwordHash: await bcrypt.hash('admin123', 12),
      name: 'Super Admin',
      merchantId: null,
      active: true,
    });
    superadminUser.roles = [superadminRole];
    await userRepo.save(superadminUser);
    const merchantAdminUser = userRepo.create({
      email: 'demo@nexgate.local',
      passwordHash: await bcrypt.hash('demo123', 12),
      name: 'Demo Admin',
      merchantId: merchant.id,
      active: true,
    });
    merchantAdminUser.roles = [merchantAdminRoleFound];
    await userRepo.save(merchantAdminUser);
    console.log('Usuários de demo criados.');
    console.log('Superadmin: admin@nexgate.local / admin123');
    console.log('Merchant demo: demo@nexgate.local / demo123');
    await ds.destroy();
    return;
  }

  const perms = [
    { code: 'transactions.read', description: 'Ver transações' },
    { code: 'transactions.write', description: 'Criar/cancelar transações' },
    { code: 'webhooks.read', description: 'Ver webhooks' },
    { code: 'webhooks.write', description: 'Configurar webhooks' },
    { code: 'api_keys.read', description: 'Ver API keys' },
    { code: 'api_keys.write', description: 'Criar/revogar API keys' },
    { code: 'connectors.read', description: 'Ver conectores' },
    { code: 'connectors.write', description: 'Configurar conectores' },
    { code: 'routing.read', description: 'Ver regras de roteamento' },
    { code: 'routing.write', description: 'Editar regras' },
    { code: 'merchants.manage', description: 'Gerenciar merchants' },
    { code: 'users.manage', description: 'Gerenciar usuários' },
    { code: 'audit.read', description: 'Ver auditoria' },
  ];
  for (const p of perms) {
    await permRepo.save(permRepo.create(p));
  }
  const allPerms = await permRepo.find();

  const superadminRole = roleRepo.create({
    name: 'superadmin',
    description: 'Super administrador',
  });
  superadminRole.permissions = allPerms;
  await roleRepo.save(superadminRole);

  const merchantAdminRole = roleRepo.create({
    name: 'merchant_admin',
    description: 'Administrador do merchant',
  });
  merchantAdminRole.permissions = allPerms.filter((p) => !['merchants.manage', 'audit.read'].includes(p.code));
  await roleRepo.save(merchantAdminRole);

  const merchantFinanceRole = roleRepo.create({
    name: 'merchant_finance',
    description: 'Financeiro',
  });
  merchantFinanceRole.permissions = allPerms.filter((p) =>
    ['transactions.read', 'webhooks.read', 'routing.read'].includes(p.code),
  );
  await roleRepo.save(merchantFinanceRole);

  const merchantDevRole = roleRepo.create({
    name: 'merchant_dev',
    description: 'Desenvolvedor',
  });
  merchantDevRole.permissions = allPerms.filter((p) =>
    ['transactions.read', 'transactions.write', 'webhooks.read', 'webhooks.write', 'api_keys.read', 'api_keys.write', 'connectors.read', 'connectors.write', 'routing.read', 'routing.write'].includes(p.code),
  );
  await roleRepo.save(merchantDevRole);

  const merchantSupportRole = roleRepo.create({
    name: 'merchant_support',
    description: 'Suporte',
  });
  merchantSupportRole.permissions = allPerms.filter((p) => ['transactions.read', 'webhooks.read'].includes(p.code));
  await roleRepo.save(merchantSupportRole);

  const superadminUser = userRepo.create({
    email: 'admin@nexgate.local',
    passwordHash: await bcrypt.hash('admin123', 12),
    name: 'Super Admin',
    merchantId: null,
    active: true,
  });
  superadminUser.roles = [superadminRole];
  await userRepo.save(superadminUser);

  const merchant = merchantRepo.create({
    slug: 'demo',
    name: 'Merchant Demo',
    document: '00000000000191',
    email: 'demo@nexgate.local',
    active: true,
    accentColor: '#2563eb',
  });
  await merchantRepo.save(merchant);

  const merchantAdminUser = userRepo.create({
    email: 'demo@nexgate.local',
    passwordHash: await bcrypt.hash('demo123', 12),
    name: 'Demo Admin',
    merchantId: merchant.id,
    active: true,
  });
  const merchantAdminRoleFound = await roleRepo.findOne({ where: { name: 'merchant_admin' } });
  if (!merchantAdminRoleFound) throw new Error('Role merchant_admin not found');
  merchantAdminUser.roles = [merchantAdminRoleFound];
  await userRepo.save(merchantAdminUser);

  const mockPixDef = defRepo.create({
    code: 'mock_pix',
    name: 'Mock Pix',
    version: '1.0',
    supportedMethods: ['pix'],
    configSchema: { apiKey: { type: 'string' } },
    webhookRoutes: ['/api/webhooks/provider/mock_pix'],
    enabled: true,
  });
  await defRepo.save(mockPixDef);

  const mockPixBDef = defRepo.create({
    code: 'mock_pix_b',
    name: 'Mock Pix B',
    version: '1.0',
    supportedMethods: ['pix'],
    configSchema: { token: { type: 'string' } },
    webhookRoutes: ['/api/webhooks/provider/mock_pix_b'],
    enabled: true,
  });
  await defRepo.save(mockPixBDef);

  const encryptedConfig = encryption.encrypt(JSON.stringify({ apiKey: 'mock-key' }));
  const mc = mcRepo.create({
    merchantId: merchant.id,
    connectorDefinitionId: mockPixDef.id,
    encryptedConfig,
    active: true,
  });
  await mcRepo.save(mc);

  const rule = ruleRepo.create({
    merchantId: merchant.id,
    connectorDefinitionId: mockPixDef.id,
    paymentMethod: 'pix',
    amountMinCents: null,
    amountMaxCents: null,
    priority: 10,
    isFallback: false,
    active: true,
  });
  await ruleRepo.save(rule);

  const publicKey = 'pk_' + crypto.randomBytes(24).toString('hex');
  const secretKey = 'sk_' + crypto.randomBytes(32).toString('hex');
  const apiKey = apiKeyRepo.create({
    merchantId: merchant.id,
    publicKey,
    secretKeyHash: await bcrypt.hash(secretKey, 12),
    name: 'Chave Demo',
    active: true,
  });
  await apiKeyRepo.save(apiKey);

  console.log('Seed concluído.');
  console.log('Superadmin: admin@nexgate.local / admin123');
  console.log('Merchant demo: demo@nexgate.local / demo123');
  console.log('API Key (mostrar uma vez):');
  console.log('  public_key:', publicKey);
  console.log('  secret_key:', secretKey);
  await ds.destroy();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
