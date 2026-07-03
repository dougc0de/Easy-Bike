import { DisponibilidadBicicleta } from '../../comun/enums/disponibilidad-bicicleta.enum';

export interface Bicicleta {
  id: string;
  nombre: string;
  categoria: string;
  descripcionCorta: string;
  detalle: string;
  precio: string;
  autonomia: string;
  disponibilidad: DisponibilidadBicicleta;
  colorAcento: string;
  recomendadoPara: string;
  urlImagen: string;
  textoAlternativoImagen: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}
