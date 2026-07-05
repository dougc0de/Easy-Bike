import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'reservas' })
export class ReservaEntidad {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ name: 'nombre_cliente', type: 'varchar', length: 140 })
  nombreCliente!: string;

  @Column({ name: 'correo_cliente', type: 'varchar', length: 180 })
  correoCliente!: string;

  @Column({ name: 'telefono_cliente', type: 'varchar', length: 40, nullable: true })
  telefonoCliente!: string | null;

  @Column({ name: 'bicicleta_id', type: 'uuid' })
  bicicletaId!: string;

  @Column({ name: 'nombre_bicicleta', type: 'varchar', length: 160 })
  nombreBicicleta!: string;

  @Column({ name: 'fecha_reserva', type: 'date' })
  fechaReserva!: string;

  @Column({ name: 'hora_reserva', type: 'varchar', length: 10 })
  horaReserva!: string;

  @Column({ name: 'duracion_horas', type: 'int' })
  duracionHoras!: number;

  @Column({ name: 'punto_recojo', type: 'varchar', length: 120 })
  puntoRecojo!: string;

  @Column({ name: 'notas', type: 'text', nullable: true })
  notas!: string | null;

  @Column({ name: 'monto', type: 'decimal', precision: 10, scale: 2 })
  monto!: number;

  @Column({ name: 'estado', type: 'varchar', length: 40 })
  estado!: string;

  @Column({ name: 'codigo_voucher', type: 'varchar', length: 80 })
  codigoVoucher!: string;

  @Column({ name: 'metodo_pago', type: 'varchar', length: 120 })
  metodoPago!: string;

  @Column({ name: 'origen', type: 'varchar', length: 40 })
  origen!: string;

  @Column({ name: 'atendida_por_usuario_id', type: 'uuid', nullable: true })
  atendidaPorUsuarioId!: string | null;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
