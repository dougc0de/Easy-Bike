import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'usuarios' })
export class UsuarioEntidad {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ name: 'email', type: 'varchar', length: 180 })
  email!: string;

  @Column({ name: 'nombre_completo', type: 'varchar', length: 140 })
  nombreCompleto!: string;

  @Column({ name: 'rol', type: 'varchar', length: 40 })
  rol!: string;

  @Column({ name: 'telefono', type: 'varchar', length: 40, nullable: true })
  telefono!: string | null;

  @Column({ name: 'password_hash', type: 'text', nullable: true })
  passwordHash!: string | null;

  @Column({ name: 'refresh_token_hash', type: 'text', nullable: true })
  refreshTokenHash!: string | null;

  @Column({ name: 'activo', type: 'boolean', default: true })
  activo!: boolean;

  @Column({ name: 'ultimo_acceso_at', type: 'timestamptz', nullable: true })
  ultimoAccesoAt!: Date | null;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
