# Easy Bike

Easy Bike es una plataforma web para mostrar, reservar y administrar bicicletas electricas.
Fue pensada para digitalizar la operacion del negocio, mejorar la atencion al cliente y
darle al equipo una herramienta clara para crecer sin depender de procesos manuales.

## Objetivo del proyecto

El sistema busca centralizar en una sola solucion el catalogo oficial de bicicletas, las
reservas en linea, la gestion de clientes y el control operativo basico del negocio.

## Cliente

El proyecto fue planteado para Easy Bike como una herramienta de adopcion tecnologica
practica, pensada para integrarse al negocio con rapidez y aportar valor desde el uso diario.
Su enfoque combina presencia comercial, reservas y operacion administrativa en una misma
plataforma.

## Que resuelve para el negocio

- Reune catalogo, disponibilidad y reservas en un mismo flujo.
- Reduce trabajo manual en la atencion y registro de solicitudes.
- Mejora la experiencia del cliente con informacion clara y acceso rapido.
- Facilita la administracion del inventario y las reservas desde un panel interno.
- Prepara a Easy Bike para escalar su operacion con una base digital mas ordenada.

## Funcionalidades principales

- Catalogo publico de bicicletas disponibles.
- Registro e inicio de sesion con autenticacion.
- Perfil de cliente con reservas, historial y voucher.
- Formulario de contacto para recibir solicitudes de clientes.
- Vista de ubicacion e informacion general del negocio.
- Panel administrativo para agregar bicicletas y gestionar disponibilidad.
- Registro de reservas en linea y reservas gestionadas desde administracion.

## Tecnologias aplicadas

- Frontend: Vue 3, TypeScript y Vite.
- Backend: NestJS, TypeScript y arquitectura modular.
- Base de datos: Supabase PostgreSQL.
- Despliegue: Render para la API y Vercel para la aplicacion web.

## Ejecucion local

1. Configura las variables de entorno del backend en `backend/.env`.
2. Si el frontend consume la API local, configura `frontend/.env` con `VITE_API_URL`.
3. Inicia el backend:

```bash
cd backend
npm install
npm run start:dev
```

4. Inicia el frontend:

```bash
cd frontend
npm install
npm run dev
```

Backend local: `http://localhost:3000`  
Frontend local: `http://localhost:5173`

Easy Bike esta pensado para facilitar la adopcion tecnologica del negocio con una
implementacion clara, util y lista para seguir creciendo junto a la empresa.
