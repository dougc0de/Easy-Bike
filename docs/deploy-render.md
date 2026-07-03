# Deploy de Backend en Render para Easy Bike

## 1. Qué va en cada lugar
- `frontend/.env.production`
  - `VITE_API_URL=https://easy-bike-pwsd.onrender.com`
- Panel de Render > Environment
  - `FRONTEND_URL=https://easy-bike-ten.vercel.app`
  - `DATABASE_URL=...`
  - `DATABASE_URL_POOLER=...`
  - `SUPABASE_PROJECT_REF=...`
  - `SUPABASE_URL=...`
  - `SUPABASE_ANON_KEY=...`
  - `SUPABASE_SERVICE_ROLE_KEY=...`
  - `JWT_SECRET=...` o dejar que Render lo genere si usas `render.yaml`
  - `JWT_REFRESH_SECRET=...` o dejar que Render lo genere si usas `render.yaml`
- Supabase > SQL Editor
  - Ejecutar el contenido de [database/script.sql](/C:/Users/User 1/Desktop/Dev section/IT Engenier/Desarrollo web III/Proyecto final - Easy Bike/database/script.sql:1)

## 2. Archivo de Render del proyecto
- El proyecto ya queda preparado con [render.yaml](/C:/Users/User 1/Desktop/Dev section/IT Engenier/Desarrollo web III/Proyecto final - Easy Bike/render.yaml:1)
- Ese archivo configura:
  - `rootDir: backend`
  - `buildCommand: npm install --include=dev && npm run build`
  - `startCommand: npm run start:prod`
  - `healthCheckPath: /salud`

## 3. Pasos en Render
1. Sube el proyecto a GitHub.
2. En Render: `New` -> `Blueprint`.
3. Conecta tu repositorio y selecciona la rama.
4. Render leerá `render.yaml`.
5. Completa las variables marcadas como secretas o manuales.
6. Despliega.

## 4. Frontend en Vercel
- En Vercel agrega:
  - `VITE_API_URL=https://easy-bike-pwsd.onrender.com`
- Si prefieres archivo local de referencia, usa [frontend/.env.production.example](/C:/Users/User 1/Desktop/Dev section/IT Engenier/Desarrollo web III/Proyecto final - Easy Bike/frontend/.env.production.example:1) como base para crear `frontend/.env.production`.

## 5. Supabase
- Ve a `SQL Editor`.
- Pega y ejecuta el contenido de `database/script.sql`.
- Si Render no conecta bien usando el host directo `:5432`, coloca la cadena pooler en `DATABASE_URL`.
  - Es decir: el backend usa `DATABASE_URL`, así que si necesitas pooler, pega ahí la URL pooler.
