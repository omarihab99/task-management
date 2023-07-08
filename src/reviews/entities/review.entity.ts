import { Column, CreateDateColumn, Entity, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'reviews' })
export class Review {
  @Column({ primary: true, type: 'uuid' })
  id: string;
  @Column()
  DS: number;
  @Column()
  QDS: number;
  @Column()
  comment: string;
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
