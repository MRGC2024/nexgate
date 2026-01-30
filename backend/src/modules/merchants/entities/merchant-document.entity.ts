import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Merchant } from './merchant.entity';

export type DocumentType =
  | 'doc_frente'
  | 'doc_verso'
  | 'selfie_documento'
  | 'comprovante_mei'
  | 'contrato_social'
  | 'comprovante_conta';

@Entity('merchant_documents')
export class MerchantDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  merchantId: string;

  @ManyToOne(() => Merchant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'merchantId' })
  merchant: Merchant;

  @Column({ type: 'varchar', length: 64 })
  documentType: DocumentType;

  /** URL, path ou data URL do arquivo (base64 para upload direto) */
  @Column({ type: 'text' })
  fileUrl: string;

  @CreateDateColumn()
  createdAt: Date;
}
