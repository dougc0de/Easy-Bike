# Supabase Scaffold para Easy Bike

Este directorio deja el cimiento para que el encargado de base de datos y backend conecte Easy Bike con Supabase sin rehacer la estructura.

## Qué dato entrega Supabase
Supabase te entregará normalmente:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- cadena de conexión PostgreSQL para `DATABASE_URL`
- cadena pooler para `DATABASE_URL_POOLER`

## De dónde sale `DATABASE_URL`
Dentro del panel de Supabase:

1. Entra al proyecto.
2. Ve a `Project Settings`.
3. Abre `Database`.
4. Busca la sección de conexión PostgreSQL.
5. Copia la cadena completa y úsala como `DATABASE_URL`.
6. Si vas a desplegar en Render u otro entorno con restricciones de red, copia también la pooler y úsala como `DATABASE_URL_POOLER`.

El backend NestJS usará esa cadena con TypeORM cuando cambies:

```env
MODO_DATOS=typeorm
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/postgres
DATABASE_URL_POOLER=postgresql://USER.PROJECT_REF:PASSWORD@HOST:6543/postgres
DB_SSL=true
```

## Cómo se conecta NestJS con TypeORM
- La app arranca por defecto en `MODO_DATOS=memoria`.
- Cuando actives `MODO_DATOS=typeorm`, `backend/src/base-datos/base-datos.module.ts` exige `DATABASE_URL` o `DATABASE_URL_POOLER`.
- La configuración final de TypeORM vive en `backend/src/base-datos/typeorm.config.ts`.
- Si existe `DATABASE_URL_POOLER`, el backend la prioriza sobre la conexión directa.
- El estado se puede revisar en `GET /salud/base-datos`.

## Qué queda pospuesto para la siguiente fase
Esta fase todavía no implementa:

- relaciones finales endurecidas
- políticas RLS
- JWT
- login y registro reales
- protección de rutas
- integración final de auth con Supabase

## Archivos de este directorio
- `script.sql`: scaffold SQL concreto por recurso.
- `supabase.env.example`: placeholders para copiar al backend o al equipo de BD.
