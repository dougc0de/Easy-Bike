import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  getHealth() {
    return {
      status: 'ok',
      service: 'easy-bike-backend',
      timestamp: new Date().toISOString(),
    };
  }

  getDatabaseStatus() {
    const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

    return {
      status: hasDatabaseUrl ? 'pending_connection_test' : 'not_configured',
      provider: 'supabase-postgres',
      configured: hasDatabaseUrl,
      message: hasDatabaseUrl
        ? 'La variable DATABASE_URL existe. Falta activar la conexion real con TypeORM.'
        : 'DATABASE_URL aun no esta configurada por el responsable de base de datos.',
    };
  }
}
