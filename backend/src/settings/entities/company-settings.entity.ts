import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('company_settings')
export class CompanySettings {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ default: 'Fishifox IT Services' })
    companyName: string;

    @Column({ type: 'text', nullable: true })
    address: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    email: string;

    // Website field removed

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    taxPercentage: number;

    @Column({ nullable: true })
    logoUrl: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
