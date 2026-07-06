import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'configuraciones_ubicacion' })
export class ConfiguracionUbicacionEntidad {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ name: 'titulo', type: 'varchar', length: 120 })
  titulo!: string;

  @Column({ name: 'subtitulo', type: 'text' })
  subtitulo!: string;

  @Column({ name: 'direccion', type: 'varchar', length: 220 })
  direccion!: string;

  @Column({ name: 'horario', type: 'varchar', length: 120 })
  horario!: string;

  @Column({ name: 'contact_phone', type: 'varchar', length: 40, default: '' })
  telefonoContacto!: string;

  @Column({ name: 'contact_email', type: 'varchar', length: 180, default: '' })
  emailContacto!: string;

  @Column({ name: 'etiqueta_cta', type: 'varchar', length: 80 })
  etiquetaCta!: string;

  @Column({ name: 'url_externa', type: 'varchar', length: 255 })
  urlExterna!: string;

  @Column({ name: 'url_imagen', type: 'varchar', length: 255, nullable: true })
  urlImagen!: string | null;

  @Column({ name: 'url_embed', type: 'varchar', length: 255, nullable: true })
  urlEmbed!: string | null;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
