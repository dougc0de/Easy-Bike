# Recolección de Seguridad y Correo para Easy Bike

Este documento reúne lo que hace falta fuera de Supabase para que podamos implementar:

- registro real
- login real
- JWT
- refresh tokens
- confirmación de correo
- protección de rutas

## 1. JWT y sesión
### Secretos de acceso
- `JWT_SECRET`:
- `JWT_REFRESH_SECRET`:

### Recomendaciones
- Usa claves largas.
- Evita valores cortos o repetidos.
- Si quieres, puedes generarlas localmente y guardarlas solo en `backend/.env`.

## 2. URLs del proyecto
### Frontend
- `FRONTEND_URL`:
  - Recomendado local: `http://localhost:5173`
- `FRONTEND_URL_PROD`:

### Backend
- `BACKEND_URL_PUBLICA`:
  - Recomendado local: `http://localhost:3000`

### Ruta de confirmación
- `RUTA_CONFIRMACION_FRONTEND`:
  - Recomendado: `/#/confirmar-cuenta`

### Decisión ya tomada
- El enlace de confirmación irá primero al frontend.
- Luego esa vista llamará al backend para validar el token.

## 3. SMTP o proveedor de correo
Para confirmación de email real con JWT propio en NestJS necesitamos un proveedor SMTP o equivalente.

### Variables necesarias
- `SMTP_HOST`:
- `SMTP_PORT`:
- `SMTP_USER`:
- `SMTP_PASS`:
- `MAIL_FROM_NAME`:
- `MAIL_FROM_EMAIL`:

### Dónde buscarlo
Depende del proveedor que uses. Ejemplos:

- Gmail SMTP:
  - configuración desde tu cuenta Google y contraseña de aplicación
- Brevo / Sendinblue:
  - panel del servicio > SMTP
- Mailtrap:
  - inbox o sandbox SMTP
- Resend / Postmark:
  - según servicio, a veces se usa API key en vez de SMTP clásico

## 4. Qué necesito que me confirmes
Cuando lo tengas listo, dime:

1. Si usarás SMTP real o servicio sandbox para desarrollo
2. Si las variables ya quedaron en `backend/.env`
3. Si el correo de salida debe verse como:
   - `Easy Bike <correo@dominio.com>`
   - o algún formato distinto

## 5. Estado actual
Marca lo que ya tengas:

- [ ] `JWT_SECRET`
- [ ] `JWT_REFRESH_SECRET`
- [ ] `FRONTEND_URL`
- [ ] `FRONTEND_URL_PROD`
- [ ] `BACKEND_URL_PUBLICA`
- [ ] `RUTA_CONFIRMACION_FRONTEND`
- [ ] `SMTP_HOST`
- [ ] `SMTP_PORT`
- [ ] `SMTP_USER`
- [ ] `SMTP_PASS`
- [ ] `MAIL_FROM_NAME`
- [ ] `MAIL_FROM_EMAIL`

## 6. Plantilla rápida para copiar a `backend/.env`
```env
FRONTEND_URL=http://localhost:5173
FRONTEND_URL_PROD=
BACKEND_URL_PUBLICA=http://localhost:3000
RUTA_CONFIRMACION_FRONTEND=/#/confirmar-cuenta

JWT_SECRET=
JWT_REFRESH_SECRET=

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
MAIL_FROM_NAME=
MAIL_FROM_EMAIL=
```
