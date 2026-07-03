import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'bicicletas' })
export class BicicletaEntidad {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ name: 'nombre', type: 'varchar', length: 160 })
  nombre!: string;

  @Column({ name: 'categoria', type: 'varchar', length: 100 })
  categoria!: string;

  @Column({ name: 'descripcion_corta', type: 'varchar', length: 220 })
  descripcionCorta!: string;

  @Column({ name: 'detalle', type: 'text' })
  detalle!: string;

  @Column({ name: 'precio', type: 'varchar', length: 80 })
  precio!: string;

  @Column({ name: 'autonomia', type: 'varchar', length: 80 })
  autonomia!: string;

  @Column({ name: 'disponibilidad', type: 'varchar', length: 40 })
  disponibilidad!: string;

  @Column({ name: 'color_acento', type: 'varchar', length: 20 })
  colorAcento!: string;

  @Column({ name: 'recomendado_para', type: 'varchar', length: 160 })
  recomendadoPara!: string;

  @Column({ name: 'url_imagen', type: 'varchar', length: 255 })
  urlImagen!: string;

  @Column({ name: 'texto_alternativo_imagen', type: 'varchar', length: 180 })
  textoAlternativoImagen!: string;

  @Column({ name: 'activo', type: 'boolean', default: true })
  activo!: boolean;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
