import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'mensajes_contacto' })
export class MensajeContactoEntidad {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ name: 'nombre', type: 'varchar', length: 140 })
  nombre!: string;

  @Column({ name: 'email', type: 'varchar', length: 180 })
  email!: string;

  @Column({ name: 'asunto', type: 'varchar', length: 180 })
  asunto!: string;

  @Column({ name: 'mensaje', type: 'text' })
  mensaje!: string;

  @Column({ name: 'ticket', type: 'varchar', length: 60 })
  ticket!: string;

  @Column({ name: 'estado', type: 'varchar', length: 40 })
  estado!: string;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
