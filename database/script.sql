-- =========================================================
-- Easy Bike - Supabase SQL Scaffold
-- =========================================================
-- Objetivo:
-- Dejar listo el esqueleto SQL para que el encargado de BD
-- complete relaciones, índices finos, RLS y endurecimiento.
--
-- Nota:
-- En Supabase ya existe la base PostgreSQL administrada.
-- Este archivo no crea la base; solo define el cimiento.
-- Está pensado para poder reejecutarse sin borrar usuarios,
-- reservas ni otra data operativa existente.

-- =========================================================
-- 1. Extensiones
-- =========================================================
create extension if not exists pgcrypto;

-- =========================================================
-- 2. Tablas base
-- =========================================================

create table if not exists public.usuarios (
  id uuid primary key default gen_random_uuid(),
  email varchar(180) not null unique,
  nombre_completo varchar(140) not null,
  rol varchar(40) not null,
  telefono varchar(40),
  password_hash text,
  refresh_token_hash text,
  activo boolean not null default true,
  ultimo_acceso_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.bicicletas (
  id uuid primary key default gen_random_uuid(),
  nombre varchar(160) not null,
  categoria varchar(100) not null,
  descripcion_corta varchar(220) not null,
  detalle text not null,
  precio varchar(80) not null,
  autonomia varchar(80) not null,
  disponibilidad varchar(40) not null,
  color_acento varchar(20) not null,
  recomendado_para varchar(160) not null,
  url_imagen varchar(255) not null,
  texto_alternativo_imagen varchar(180) not null,
  activo boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.reservas (
  id uuid primary key default gen_random_uuid(),
  nombre_cliente varchar(140) not null,
  correo_cliente varchar(180) not null,
  telefono_cliente varchar(40),
  bicicleta_id uuid not null,
  nombre_bicicleta varchar(160) not null,
  fecha_reserva date not null,
  hora_reserva varchar(10) not null,
  duracion_horas integer not null,
  punto_recojo varchar(120) not null,
  notas text,
  monto numeric(10, 2) not null,
  estado varchar(40) not null,
  codigo_voucher varchar(80) not null unique,
  metodo_pago varchar(120) not null,
  origen varchar(40) not null,
  atendida_por_usuario_id uuid,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint fk_reservas_bicicleta
    foreign key (bicicleta_id)
    references public.bicicletas(id),
  constraint fk_reservas_usuario_atiende
    foreign key (atendida_por_usuario_id)
    references public.usuarios(id)
);

create table if not exists public.mensajes_contacto (
  id uuid primary key default gen_random_uuid(),
  nombre varchar(140) not null,
  email varchar(180) not null,
  asunto varchar(180) not null,
  mensaje text not null,
  ticket varchar(60) not null unique,
  estado varchar(40) not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.configuraciones_ubicacion (
  id uuid primary key default gen_random_uuid(),
  titulo varchar(120) not null,
  subtitulo text not null,
  direccion varchar(220) not null,
  horario varchar(120) not null,
  contact_phone varchar(40) not null default '',
  contact_email varchar(180) not null default '',
  etiqueta_cta varchar(80) not null,
  url_externa varchar(255) not null,
  url_imagen varchar(255),
  url_embed varchar(255),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- =========================================================
-- 2.1. Compatibilidad con esquemas previos
-- =========================================================
-- Si la tabla usuarios ya existía desde una versión anterior,
-- estos ALTER TABLE agregan las columnas necesarias para auth real.
alter table if exists public.usuarios
  add column if not exists password_hash text;

alter table if exists public.usuarios
  add column if not exists refresh_token_hash text;

alter table if exists public.usuarios
  add column if not exists activo boolean not null default true;

alter table if exists public.usuarios
  add column if not exists ultimo_acceso_at timestamptz;

alter table if exists public.reservas
  alter column telefono_cliente drop not null;

alter table if exists public.configuraciones_ubicacion
  add column if not exists contact_phone varchar(40) not null default '';

alter table if exists public.configuraciones_ubicacion
  add column if not exists contact_email varchar(180) not null default '';

update public.configuraciones_ubicacion
set contact_phone = ''
where contact_phone is null;

update public.configuraciones_ubicacion
set contact_email = ''
where contact_email is null;

alter table if exists public.configuraciones_ubicacion
  alter column contact_phone set default '';

alter table if exists public.configuraciones_ubicacion
  alter column contact_email set default '';

alter table if exists public.configuraciones_ubicacion
  alter column contact_phone set not null;

alter table if exists public.configuraciones_ubicacion
  alter column contact_email set not null;

-- =========================================================
-- 3. Índices sugeridos
-- =========================================================
create index if not exists idx_usuarios_email on public.usuarios(email);
create index if not exists idx_bicicletas_categoria on public.bicicletas(categoria);
create index if not exists idx_bicicletas_disponibilidad on public.bicicletas(disponibilidad);
create index if not exists idx_reservas_correo_cliente on public.reservas(correo_cliente);
create index if not exists idx_reservas_bicicleta_id on public.reservas(bicicleta_id);
create index if not exists idx_reservas_estado on public.reservas(estado);
create index if not exists idx_contactos_estado on public.mensajes_contacto(estado);

-- =========================================================
-- 4. Aprovisionamiento inicial manual
-- =========================================================
-- La aplicación no debe sembrar usuarios, bicicletas, reservas ni ubicaciones al iniciar.
-- Si la base está vacía, aprovisiona manualmente aquí o desde herramientas administrativas.
-- Este script no incluye DROP, TRUNCATE ni DELETE sobre usuarios o reservas existentes.
--
-- Catálogo oficial Easy Bike:
-- Estas sentencias restauran o actualizan el catálogo real del negocio sin tocar usuarios,
-- reservas ni cambiar IDs de bicicletas ya existentes con el mismo nombre.
--
-- Configuración pública de mapa y contacto:
-- Estas sentencias restauran la ubicación operativa real de Easy Bike sin tocar usuarios
-- ni reservas. Si ya existe el registro oficial, lo actualiza; si no existe, lo inserta.

update public.configuraciones_ubicacion
set
  subtitulo = 'Ubicación oficial de Easy Bike para atención, reservas y retiro de bicicletas en León.',
  direccion = 'Iglesia El Calvario, 2 cuadras al sur, en el Barrio El Calvario, León.',
  horario = 'Lunes a sábado · 8:00 a.m. - 8:00 p.m.',
  contact_phone = '+505 8913-4973',
  contact_email = 'de575836@gmail.com',
  etiqueta_cta = 'Abrir en Google Maps',
  url_externa = 'https://www.google.com/maps/search/?api=1&query=12%C2%B026%2706.8%22N%2086%C2%B052%2723.2%22W',
  url_imagen = '',
  url_embed = '',
  updated_at = timezone('utc', now())
where lower(titulo) = lower('Encuéntranos fácilmente');

insert into public.configuraciones_ubicacion (
  id,
  titulo,
  subtitulo,
  direccion,
  horario,
  contact_phone,
  contact_email,
  etiqueta_cta,
  url_externa,
  url_imagen,
  url_embed
)
select
  '3d2feecb-1558-4a18-832a-0d5517e83009',
  'Encuéntranos fácilmente',
  'Ubicación oficial de Easy Bike para atención, reservas y retiro de bicicletas en León.',
  'Iglesia El Calvario, 2 cuadras al sur, en el Barrio El Calvario, León.',
  'Lunes a sábado · 8:00 a.m. - 8:00 p.m.',
  '+505 8913-4973',
  'de575836@gmail.com',
  'Abrir en Google Maps',
  'https://www.google.com/maps/search/?api=1&query=12%C2%B026%2706.8%22N%2086%C2%B052%2723.2%22W',
  '',
  ''
where not exists (
  select 1
  from public.configuraciones_ubicacion
  where lower(titulo) = lower('Encuéntranos fácilmente')
);

update public.bicicletas
set
  categoria = 'Urbana',
  descripcion_corta = 'Ligera, estable y perfecta para moverte entre clases, trabajo y recados.',
  detalle = 'Perfecta para desplazamientos en la ciudad, cómoda, práctica y fácil de manejar. Ideal si quieres un recorrido ágil con postura relajada.',
  precio = 'Desde $22 / 24 h',
  autonomia = 'Hasta 45 km',
  disponibilidad = 'Disponible',
  color_acento = '#f28705',
  recomendado_para = 'Recorridos diarios y traslados rápidos.',
  url_imagen = '/images/carruselBici1.jpg',
  texto_alternativo_imagen = 'Bicicleta eléctrica urbana Easy Bike',
  activo = true,
  updated_at = timezone('utc', now())
where lower(nombre) = lower('Bicicleta eléctrica urbana');

insert into public.bicicletas (
  id,
  nombre,
  categoria,
  descripcion_corta,
  detalle,
  precio,
  autonomia,
  disponibilidad,
  color_acento,
  recomendado_para,
  url_imagen,
  texto_alternativo_imagen,
  activo
)
select
  '6d2feecb-1558-4a18-832a-0d5517e83001',
  'Bicicleta eléctrica urbana',
  'Urbana',
  'Ligera, estable y perfecta para moverte entre clases, trabajo y recados.',
  'Perfecta para desplazamientos en la ciudad, cómoda, práctica y fácil de manejar. Ideal si quieres un recorrido ágil con postura relajada.',
  'Desde $22 / 24 h',
  'Hasta 45 km',
  'Disponible',
  '#f28705',
  'Recorridos diarios y traslados rápidos.',
  '/images/carruselBici1.jpg',
  'Bicicleta eléctrica urbana Easy Bike',
  true
where not exists (
  select 1
  from public.bicicletas
  where lower(nombre) = lower('Bicicleta eléctrica urbana')
);

update public.bicicletas
set
  categoria = 'Plegable',
  descripcion_corta = 'Compacta para departamentos, oficinas y usuarios que combinan trayectos.',
  detalle = 'Su diseño plegable la hace ideal para usuarios que necesitan ahorrar espacio y combinar movilidad con transporte público.',
  precio = 'Desde $25 / 24 h',
  autonomia = 'Hasta 35 km',
  disponibilidad = 'Últimas unidades',
  color_acento = '#1b7f8f',
  recomendado_para = 'Espacios reducidos y trayectos mixtos.',
  url_imagen = '/images/carruselBici2-BicicletaElectricaPlegable.jpg',
  texto_alternativo_imagen = 'Bicicleta plegable City Flow Easy Bike',
  activo = true,
  updated_at = timezone('utc', now())
where lower(nombre) = lower('City Flow plegable');

insert into public.bicicletas (
  id,
  nombre,
  categoria,
  descripcion_corta,
  detalle,
  precio,
  autonomia,
  disponibilidad,
  color_acento,
  recomendado_para,
  url_imagen,
  texto_alternativo_imagen,
  activo
)
select
  '7d2feecb-1558-4a18-832a-0d5517e83002',
  'City Flow plegable',
  'Plegable',
  'Compacta para departamentos, oficinas y usuarios que combinan trayectos.',
  'Su diseño plegable la hace ideal para usuarios que necesitan ahorrar espacio y combinar movilidad con transporte público.',
  'Desde $25 / 24 h',
  'Hasta 35 km',
  'Últimas unidades',
  '#1b7f8f',
  'Espacios reducidos y trayectos mixtos.',
  '/images/carruselBici2-BicicletaElectricaPlegable.jpg',
  'Bicicleta plegable City Flow Easy Bike',
  true
where not exists (
  select 1
  from public.bicicletas
  where lower(nombre) = lower('City Flow plegable')
);

update public.bicicletas
set
  categoria = 'Todoterreno',
  descripcion_corta = 'Construida para superficies irregulares y rutas más largas de fin de semana.',
  detalle = 'Ofrece mayor soporte, llantas robustas y un perfil más aventurero para quienes quieren una bici eléctrica versátil.',
  precio = 'Desde $31 / 24 h',
  autonomia = 'Hasta 55 km',
  disponibilidad = 'Disponible',
  color_acento = '#18362f',
  recomendado_para = 'Aventura ligera y rutas urbanas exigentes.',
  url_imagen = '/images/carruselBici2.jpg',
  texto_alternativo_imagen = 'Bicicleta todoterreno Terra X Easy Bike',
  activo = true,
  updated_at = timezone('utc', now())
where lower(nombre) = lower('Terra X adventure');

insert into public.bicicletas (
  id,
  nombre,
  categoria,
  descripcion_corta,
  detalle,
  precio,
  autonomia,
  disponibilidad,
  color_acento,
  recomendado_para,
  url_imagen,
  texto_alternativo_imagen,
  activo
)
select
  '8d2feecb-1558-4a18-832a-0d5517e83003',
  'Terra X adventure',
  'Todoterreno',
  'Construida para superficies irregulares y rutas más largas de fin de semana.',
  'Ofrece mayor soporte, llantas robustas y un perfil más aventurero para quienes quieren una bici eléctrica versátil.',
  'Desde $31 / 24 h',
  'Hasta 55 km',
  'Disponible',
  '#18362f',
  'Aventura ligera y rutas urbanas exigentes.',
  '/images/carruselBici2.jpg',
  'Bicicleta todoterreno Terra X Easy Bike',
  true
where not exists (
  select 1
  from public.bicicletas
  where lower(nombre) = lower('Terra X adventure')
);

update public.bicicletas
set
  categoria = 'Confort',
  descripcion_corta = 'Una opción cómoda, estable y con postura alta para trayectos relajados.',
  detalle = 'Pensada para quienes priorizan confort, seguridad y una experiencia muy amigable al conducir por la ciudad.',
  precio = 'Desde $27 / 24 h',
  autonomia = 'Hasta 40 km',
  disponibilidad = 'Próximamente',
  color_acento = '#53b9cc',
  recomendado_para = 'Usuarios primerizos y trayectos tranquilos.',
  url_imagen = '/images/carruselBici1.jpg',
  texto_alternativo_imagen = 'Bicicleta confort Swift Comfort Easy Bike',
  activo = true,
  updated_at = timezone('utc', now())
where lower(nombre) = lower('Swift Comfort');

insert into public.bicicletas (
  id,
  nombre,
  categoria,
  descripcion_corta,
  detalle,
  precio,
  autonomia,
  disponibilidad,
  color_acento,
  recomendado_para,
  url_imagen,
  texto_alternativo_imagen,
  activo
)
select
  '9d2feecb-1558-4a18-832a-0d5517e83004',
  'Swift Comfort',
  'Confort',
  'Una opción cómoda, estable y con postura alta para trayectos relajados.',
  'Pensada para quienes priorizan confort, seguridad y una experiencia muy amigable al conducir por la ciudad.',
  'Desde $27 / 24 h',
  'Hasta 40 km',
  'Próximamente',
  '#53b9cc',
  'Usuarios primerizos y trayectos tranquilos.',
  '/images/carruselBici1.jpg',
  'Bicicleta confort Swift Comfort Easy Bike',
  true
where not exists (
  select 1
  from public.bicicletas
  where lower(nombre) = lower('Swift Comfort')
);

-- =========================================================
-- 5. Triggers sugeridos para updated_at
-- =========================================================
-- create or replace function public.set_updated_at()
-- returns trigger as $$
-- begin
--   new.updated_at = timezone('utc', now());
--   return new;
-- end;
-- $$ language plpgsql;
--
-- create trigger trg_usuarios_updated_at
-- before update on public.usuarios
-- for each row execute function public.set_updated_at();

-- =========================================================
-- 6. RLS
-- =========================================================
-- Se deja pendiente para la siguiente fase:
-- - políticas por rol
-- - reservas solo del cliente autenticado
-- - administración con permisos elevados
-- - integración con auth.uid() de Supabase

select 'Easy Bike Supabase scaffold ready' as message;
