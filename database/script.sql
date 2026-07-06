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
