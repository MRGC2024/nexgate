import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('connector_definitions')
export class ConnectorDefinition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  version: string;

  @Column({ type: 'simple-array' })
  supportedMethods: string[]; // pix, boleto, card

  @Column({ type: 'jsonb', nullable: true })
  configSchema: Record<string, unknown>;

  @Column({ type: 'simple-array', nullable: true })
  webhookRoutes: string[];

  @Column({ default: true })
  enabled: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
