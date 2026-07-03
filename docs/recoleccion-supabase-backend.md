# Recolección de Datos Supabase para Backend Easy Bike

Este documento es una plantilla para que reúnas los datos del proyecto de Supabase que necesitaremos para conectar NestJS, TypeORM y la futura capa de seguridad del sistema.

## Cómo usar este documento
- Llena los campos pendientes.
- Si un dato es sensible, puedes colocarlo directamente en `backend/.env` en lugar de pegarlo por chat.
- Cuando termines, me puedes compartir:
  - los valores no sensibles aquí mismo
  - o confirmarme que ya quedaron escritos en `backend/.env`

## 1. Información general del proyecto
### Proyecto
- Nombre del proyecto:
- Organización o workspace:
- Región:
- URL del panel del proyecto:

### Identificador del proyecto
- `SUPABASE_PROJECT_REF`:
- Dónde encontrarlo:
  - En la URL del proyecto, por ejemplo `https://xxxxx.supabase.co`
  - También suele verse en `Project Settings > General`

## 2. Accesos de API
### URL del proyecto
- `SUPABASE_URL`:
- Dónde encontrarla:
  - `Supabase > Project Settings > API > Project URL`

### Clave pública
- `SUPABASE_ANON_KEY`:
- Dónde encontrarla:
  - `Supabase > Project Settings > API > Project API keys > anon / public`

### Clave administrativa
- `SUPABASE_SERVICE_ROLE_KEY`:
- Dónde encontrarla:
  - `Supabase > Project Settings > API > Project API keys > service_role`
- Nota:
  - Es muy sensible.
  - Si prefieres, no me la compartas por chat y colócala solo en `backend/.env`.
  - Para el diseño actual con JWT propio no es el primer requisito, pero sí puede servir después para tareas administrativas.

## 3. Accesos de base de datos
### Cadena directa PostgreSQL
- `DATABASE_URL`:
- Dónde encontrarla:
  - `Supabase > Project Settings > Database > Connection string > URI`

### Connection pooler
- `DATABASE_URL_POOLER`:
- Dónde encontrarla:
  - `Supabase > Project Settings > Database > Connection pooling`
- Nota:
  - No es obligatoria para arrancar local, pero sí muy útil para despliegue.

### SSL
- `DB_SSL`:
- Valor recomendado:
  - `true`

## 4. Estado actual del proyecto Supabase
Marca lo que ya tienes:

- [ ] Proyecto creado
- [ ] Contraseña de la base guardada
- [ ] `SUPABASE_PROJECT_REF`
- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `DATABASE_URL`
- [ ] `DATABASE_URL_POOLER`

## 5. Qué necesito que me confirmes después
Cuando llenes esto, dime:

1. Si `DATABASE_URL` ya quedó en `backend/.env`
2. Si `SUPABASE_URL` y `SUPABASE_ANON_KEY` ya están listos
3. Si quieres que usemos también `SERVICE_ROLE_KEY` en la fase de administración

## 6. Resumen rápido de dónde buscar cada dato
- `SUPABASE_PROJECT_REF`
  - URL del proyecto o `Project Settings > General`
- `SUPABASE_URL`
  - `Project Settings > API > Project URL`
- `SUPABASE_ANON_KEY`
  - `Project Settings > API > Project API keys > anon / public`
- `SUPABASE_SERVICE_ROLE_KEY`
  - `Project Settings > API > Project API keys > service_role`
- `DATABASE_URL`
  - `Project Settings > Database > Connection string > URI`
- `DATABASE_URL_POOLER`
  - `Project Settings > Database > Connection pooling`
