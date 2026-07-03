# Contexto del Proyecto Easy Bike

## 1. Resumen general
Easy Bike es una plataforma web para mostrar, reservar y administrar bicicletas eléctricas. El frontend actual ya cubre la experiencia visual y los flujos principales con datos mock, por lo que el siguiente paso natural es que el equipo backend implemente la capa remota en `backend/` para reemplazar la persistencia local y responder con datos reales usando NestJS y Supabase.

El proyecto está pensado para tres tipos de uso:

- Visitante público que explora el catálogo, conoce la marca y contacta al negocio.
- Cliente autenticado que reserva bicicletas y obtiene un voucher.
- Personal administrativo que gestiona bicicletas, disponibilidad, reservas y métricas básicas.

## 2. Misión y visión
### Misión
Ofrecer una experiencia clara, rápida y confiable para reservar bicicletas eléctricas, reduciendo fricción desde la exploración del catálogo hasta la confirmación de retiro.

### Visión
Consolidar a Easy Bike como una referencia de movilidad eléctrica con una plataforma moderna, sobria y escalable, preparada para crecer con backend real, métricas, autenticación y operación remota.

## 3. Qué hace actualmente el sitio
Hoy el frontend ya permite:

- Mostrar la marca Easy Bike y su propuesta de valor.
- Listar bicicletas disponibles con categoría, precio, autonomía, estado e imagen.
- Mostrar ubicación del negocio y acceso a Google Maps.
- Enviar mensajes desde un formulario de contacto.
- Iniciar sesión de forma mock.
- Registrar usuarios cliente de forma mock.
- Permitir reservas desde la página pública de bicicletas.
- Permitir reservas desde el perfil del cliente.
- Permitir reservas presenciales desde el panel administrativo.
- Generar vouchers visuales de reserva.
- Registrar bicicletas nuevas desde el panel admin.
- Cambiar disponibilidad de bicicletas desde el panel admin.
- Mostrar un resumen administrativo de disponibilidad y contabilidad mock.

## 4. Stack actual
- Frontend: Vue 3 + TypeScript + Vite.
- Routing: hash routing desde `App.vue`.
- Persistencia temporal actual: `localStorage`.
- Backend esperado: NestJS.
- Base de datos esperada: Supabase PostgreSQL.
- Posible autenticación real: Supabase Auth o auth propia en NestJS.

## 5. Roles del sistema
### Visitante
Puede:

- Ver la página de inicio.
- Ver bicicletas disponibles.
- Ver la página Sobre nosotros.
- Ver la página Contáctanos.
- Ver el mapa y abrir Google Maps.
- Ir a iniciar sesión o registrarse.

No puede:

- Confirmar reservas finales sin autenticarse.
- Entrar al perfil cliente.
- Entrar al panel admin.

### Cliente
Puede:

- Iniciar sesión.
- Ver su perfil.
- Reservar una bicicleta si está disponible o en últimas unidades.
- Ver su voucher generado.
- Ver reservas activas e historial.

### Administración
Puede:

- Iniciar sesión.
- Entrar al panel admin.
- Registrar nuevas bicicletas.
- Cambiar disponibilidad de bicicletas.
- Ver resumen por tipo de bicicleta.
- Hacer reservas en tienda para atención presencial.
- Ver resumen contable de reservas.

## 6. Páginas actuales del frontend
### `#/inicio`
Landing principal con hero, beneficios, preview de bicicletas y bloque de ubicación.

### `#/bicicletas`
Página pública del catálogo. Muestra resumen del servicio, catálogo funcional y formulario de reserva.

### `#/sobre-nosotros`
Página institucional con mensaje de marca, visión del proyecto y explicación del enfoque del servicio.

### `#/contactanos`
Página con datos de contacto y formulario para consultas.

### `#/login`
Pantalla de inicio de sesión. Ya no muestra accesos rápidos visibles de prueba.

### `#/registrarse`
Pantalla de registro público. Solo crea cuentas de cliente.

### `#/perfil-cliente`
Vista privada para clientes con formulario de reserva, voucher, reservas activas e historial.

### `#/panel-admin`
Vista privada para administración con alta de bicicletas, control de disponibilidad, reserva en tienda y métricas.

## 7. Formularios existentes y campos
### 7.1. Formulario de contacto
Ubicación: página `Contáctanos`.

Campos:

- `name`
- `email`
- `subject`
- `message`

Objetivo backend:

- Guardar mensaje.
- Generar ticket o código.
- Permitir posterior seguimiento.

### 7.2. Formulario de login
Ubicación: página `Iniciar sesión`.

Campos:

- `email`
- `password`

Objetivo backend:

- Validar credenciales.
- Retornar sesión real.
- Retornar rol.
- Retornar nombre visible del usuario.

### 7.3. Formulario de registro
Ubicación: página `Registrarse`.

Campos:

- `name`
- `email`
- `password`
- `confirmPassword`

Reglas actuales:

- Solo crea usuarios con rol `cliente`.
- Valida campos obligatorios.
- Valida formato básico de correo.
- Verifica que contraseña y confirmación coincidan.
- Verifica que el correo no exista ya.
- Al registrarse inicia sesión automáticamente.

### 7.4. Formulario público de reserva
Ubicación: página `Bicicletas disponibles`.

Campos:

- `fullName`
- `email`
- `phone`
- `bikeId`
- `date`
- `time`
- `duration`
- `pickupPoint`
- `notes`

Reglas actuales:

- Si no hay sesión, se redirige a login.
- Solo permite reservar bicicletas seleccionadas desde el catálogo.
- `duration` maneja opciones `4`, `8`, `12` y `24` horas.
- `pickupPoint` es fijo y de solo lectura: `Punto Central Easy Bike`.
- `time` solo puede estar entre `08:00` y `20:00`.
- El pago no se hace online: se paga físicamente al retirar la bicicleta.
- El resultado esperado es un voucher.

### 7.5. Formulario de reserva en perfil cliente
Ubicación: `Easy Bike Profile`.

Campos:

- `fullName`
- `email`
- `phone`
- `date`
- `time`
- `duration`
- `pickupPoint`
- `notes`

Comportamiento:

- La bicicleta se elige antes del formulario.
- Solo aparecen bicicletas aptas para reservar.
- El sistema genera voucher.
- El cliente ve reservas activas e historial.
- El éxito se muestra con modal dentro de la misma página.

### 7.6. Formulario admin para registrar bicicleta
Ubicación: `Panel admin`.

Campos:

- `name`
- `category`
- `availability`
- `price`
- `autonomy`
- `imageUrl`
- `description`

Objetivo backend:

- Crear un nuevo registro de bicicleta.
- Dejarlo visible para frontend público y admin.

### 7.7. Formulario admin para reservar en tienda
Ubicación: `Panel admin`.

Campos:

- `fullName`
- `email`
- `phone`
- `duration`
- `date`
- `time`
- `pickupPoint`
- `notes`
- bicicleta seleccionada desde lista de modelos reservables

Reglas:

- Solo bicicletas con estado `Disponible` o `Últimas unidades`.
- Hora entre `08:00` y `20:00`.
- Punto de recojo fijo: `Punto Central Easy Bike`.
- Pago físico al retirar.
- Generación de voucher.
- Debe quedar asociada a quien atendió si el backend luego desea auditar.

## 8. Reglas de negocio ya definidas
- Estados de disponibilidad de bicicleta:
  - `Disponible`
  - `Últimas unidades`
  - `Próximamente`
- Estados de reserva usados hoy:
  - `Pendiente de entrega`
  - `Activa`
  - `Completada`
- Roles:
  - `cliente`
  - `administracion`
- Horario permitido de retiro: `08:00` a `20:00`.
- Punto de recojo actual único: `Punto Central Easy Bike`.
- Dirección visible del negocio:
  - `Iglesia El Calvario, 2 cuadras al sur, en el Barrio El Calvario, León.`
- Coordenadas de referencia:
  - `12°26'06.8"N 86°52'23.2"W`
- El pago se realiza físicamente al retirar la bicicleta.
- El voucher debe generarse inmediatamente después de reservar.

Nota importante:

- Existen algunos datos mock viejos con otros puntos de recojo. Eso no representa la regla final del negocio. La regla vigente es manejar un solo punto de recojo.

## 9. Estado técnico actual del frontend
Actualmente el frontend funciona con mocks y persistencia local:

- `easybike-auth-session`
- `easybike-catalog`
- `easybike-reservations`
- `easybike-mock-users`

Eso significa que backend debe reemplazar estas responsabilidades:

- autenticación mock
- registro mock
- catálogo mock
- reservas mock
- disponibilidad mock
- resumen admin mock
- mensajes de contacto mock

El frontend ya tiene una variable `VITE_API_URL` y por defecto usa `http://localhost:3000`. Esa será la base natural para apuntar al backend NestJS cuando se conecte de verdad.

## 10. Qué debe implementar backend en `backend/`
La carpeta `backend/` debería convertirse en una API remota que:

- reciba peticiones del frontend
- valide reglas de negocio
- se conecte a Supabase
- guarde y consulte información real
- retorne respuestas compatibles con la UI actual

### Recomendación de arquitectura
Se recomienda esta estructura:

- NestJS como capa API y de negocio.
- Supabase PostgreSQL como base de datos principal.
- Supabase Auth para autenticación real, si el equipo lo decide.
- Supabase Storage para imágenes de bicicletas, si luego dejan de vivir en `public/images`.

### Nota sobre TypeORM
Sí se puede usar TypeORM con Supabase porque Supabase usa PostgreSQL. Si el equipo backend quiere mantener NestJS + TypeORM, es totalmente viable conectando `DATABASE_URL` al Postgres de Supabase.

## 11. Módulos sugeridos para NestJS
- `auth`
- `users`
- `bikes`
- `reservations`
- `admin`
- `contact`
- `locations`

## 12. Tablas sugeridas en Supabase
### `profiles`
Propósito: representar al usuario de aplicación y su rol.

Campos sugeridos:

- `id` UUID
- `email`
- `full_name`
- `role`
- `phone`
- `created_at`
- `updated_at`

### `bikes`
Propósito: catálogo de bicicletas.

Campos sugeridos:

- `id` UUID
- `name`
- `category`
- `short_description`
- `detail`
- `price_label`
- `daily_price`
- `autonomy_label`
- `autonomy_km`
- `availability`
- `recommended_for`
- `image_url`
- `image_alt`
- `is_active`
- `created_at`
- `updated_at`

### `reservations`
Propósito: registrar reservas hechas por cliente o por admin.

Campos sugeridos:

- `id` UUID
- `customer_id` UUID nullable
- `customer_name`
- `customer_email`
- `customer_phone`
- `bike_id`
- `reservation_date`
- `reservation_time`
- `duration_hours`
- `pickup_point`
- `notes`
- `amount`
- `status`
- `voucher_code`
- `payment_method`
- `payment_status`
- `origin`
- `handled_by` UUID nullable
- `created_at`
- `updated_at`

### `contact_messages`
Propósito: almacenar consultas del formulario de contacto.

Campos sugeridos:

- `id` UUID
- `name`
- `email`
- `subject`
- `message`
- `ticket_code`
- `status`
- `created_at`

### `location_settings`
Propósito: poder administrar desde backend lo relativo al mapa y contacto físico.

Campos sugeridos:

- `id`
- `title`
- `subtitle`
- `address`
- `schedule`
- `external_url`
- `embed_url`
- `updated_at`

## 13. Endpoints sugeridos para cubrir el frontend actual
### Autenticación
- `POST /auth/login`
- `POST /auth/register`
- `GET /auth/me`

### Catálogo
- `GET /bikes`
- `GET /bikes/:id`

### Administración de bicicletas
- `POST /admin/bikes`
- `PATCH /admin/bikes/:id/availability`
- `GET /admin/bikes/availability-by-category`

### Reservas cliente
- `POST /reservations`
- `GET /reservations/me`

### Reservas admin en tienda
- `POST /admin/reservations`
- `GET /admin/reservations`

### Dashboard admin
- `GET /admin/dashboard`

### Contacto
- `POST /contact`

### Ubicación
- `GET /locations/map-config`

## 14. Respuestas que el frontend necesitará
### Para login
Debe retornar al menos:

- `email`
- `role`
- `loggedAt`
- `name`

### Para bicicletas
El frontend hoy consume:

- `id`
- `name`
- `category`
- `shortDescription`
- `detail`
- `price`
- `autonomy`
- `availability`
- `accent`
- `recommendedFor`
- `imageUrl`
- `imageAlt`

Recomendación:

- Guardar en base valores normalizados como `daily_price` y `autonomy_km`.
- Transformarlos en backend a etiquetas listas para UI si quieren mantener el frontend sin refactor inmediato.

### Para reservas
El frontend necesita:

- código de voucher
- nombre de bicicleta
- fecha
- hora
- duración
- punto de recojo
- método de pago
- nota del voucher
- monto
- estado de la reserva

### Para dashboard admin
El frontend ya muestra:

- total de bicicletas registradas
- cantidad listas para reservar
- cantidad de entregas pendientes
- monto acumulado por reservas
- disponibilidad agrupada por categoría

El bloque `Disponibles por tipo de bicicleta` debe poder devolver, por categoría:

- `category`
- `availableCount`
- `lastUnitsCount`
- `totalCount`

## 15. Validaciones que backend debe repetir
Aunque frontend ya valida, backend debe volver a validar:

- correo válido
- campos obligatorios
- rol permitido
- existencia de bicicleta
- disponibilidad real de bicicleta
- hora de retiro dentro de `08:00` a `20:00`
- fecha no vencida
- duración permitida
- punto de recojo permitido
- generación única de voucher

## 16. Seguridad y permisos sugeridos
### Cliente
- solo debe ver sus propias reservas
- no debe crear bicicletas
- no debe cambiar disponibilidad
- no debe ver contabilidad global

### Administración
- puede crear bicicletas
- puede actualizar disponibilidad
- puede ver reservas y métricas globales
- puede registrar reservas en tienda

### Supabase
Si usan Supabase Auth + tablas propias, conviene aplicar RLS para:

- limitar acceso de clientes a sus reservas
- permitir acceso administrativo controlado
- evitar lecturas o escrituras indebidas desde el cliente

## 17. Variables de entorno sugeridas
### Frontend
- `VITE_API_URL`

### Backend
- `PORT`
- `DATABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET` si la sesión la manejará NestJS

## 18. Puntos importantes para no romper el frontend
- Mantener los nombres funcionales de roles:
  - `cliente`
  - `administracion`
- Mantener los estados de disponibilidad:
  - `Disponible`
  - `Últimas unidades`
  - `Próximamente`
- Mantener los estados de reserva actuales mientras no se ajuste frontend.
- Mantener el concepto de voucher inmediato tras la reserva.
- Mantener el punto de recojo fijo en esta etapa.
- No exponer credenciales mock en producción.

## 19. Conclusión para el equipo backend
El frontend ya dejó resuelto el flujo visual, los formularios y gran parte de la lógica de interacción. Lo que hace falta ahora en `backend/` es implementar una API NestJS que tome ese flujo y lo vuelva real usando Supabase como base persistente.

En otras palabras, backend debe encargarse de:

- autenticación real
- persistencia de usuarios
- persistencia de bicicletas
- persistencia de reservas
- generación real de vouchers y códigos
- disponibilidad real por tipo de bicicleta
- resumen administrativo
- mensajes de contacto
- datos remotos del mapa si se desea dinamizar esa parte

Con eso, el proyecto quedará listo para que frontend deje de depender de `localStorage` y funcione como una plataforma web conectada de verdad.
