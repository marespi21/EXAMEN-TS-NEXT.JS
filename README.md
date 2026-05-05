# AION Reservas

Aplicacion web de reservas para restaurante desarrollada con Next.js, TypeScript y Prisma.

## Objetivo del proyecto

Implementar una solucion funcional para:

- registro e inicio de sesion de usuarios
- gestion de sesion con JWT (access y refresh token)
- consulta y creacion de reservas
- visualizacion de reservas en dashboard y calendario

## Stack tecnologico

- `Next.js 16` (App Router)
- `TypeScript`
- `Prisma ORM`
- `SQLite` para desarrollo local
- `JWT` con `jose`
- `bcryptjs` para hash de contraseñas

## Estructura del proyecto

```text
src/
  app/
    (auth)/
    api/
      auth/
      reservas/
      seed/
    dashboard/
    reservas/
  lib/
    db/
    jwt.ts
    session.ts
    cookies.ts
prisma/
  schema.prisma
```

## Requisitos previos

- `Node.js` 20 o superior
- `npm` 10 o superior

## Configuracion de entorno

Crear archivo `.env` en la raiz del proyecto:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="dev_jwt_secret_min_32_characters_12345"
JWT_REFRESH_SECRET="dev_refresh_secret_min_32_chars_67890"
```

## Instalacion y ejecucion local

```bash
# 1) Entrar al proyecto
cd "EXAMEN-TS-NEXT.JS"

# 2) Instalar dependencias
npm install

# 3) Generar cliente de Prisma
npx prisma generate

# 4) Crear/sincronizar tablas en SQLite
npx prisma db push

# 5) Levantar servidor de desarrollo
npm run dev -- --hostname 127.0.0.1 --port 3001
```

Abrir en navegador:

- [http://127.0.0.1:3001](http://127.0.0.1:3001)

## Scripts disponibles

- `npm run dev`: inicia el entorno de desarrollo (webpack)
- `npm run build`: compila para produccion
- `npm run start`: inicia la build de produccion
- `npm run lint`: ejecuta linter

## Endpoints principales

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`

### Reservas

- `GET /api/reservas`
- `POST /api/reservas`
- `GET /api/reservas/servicios`

### Seed

- `GET /api/seed` (solo desarrollo)

## Validacion funcional sugerida

1. Registrar usuario en `/register`.
2. Iniciar sesion en `/login`.
3. Confirmar acceso a `/dashboard`.
4. Crear reserva en `/reservas`.
5. Verificar reservas en dashboard/calendario.

## Solucion de errores comunes

### 1) Error `ENOENT: package.json`

Causa: comando ejecutado en carpeta incorrecta.

Solucion:

```bash
cd "/ruta/al/proyecto/EXAMEN-TS-NEXT.JS"
```

### 2) Error `P1012` en Prisma (URL invalida para SQLite)

Causa: `DATABASE_URL` no inicia con `file:`.

Solucion:

```env
DATABASE_URL="file:./dev.db"
```

### 3) Error `P2021` (tabla no existe)

Causa: base de datos sin sincronizar con el schema.

Solucion:

```bash
npx prisma db push
```

### 4) Error `EADDRINUSE` (puerto ocupado)

Solucion: usar otro puerto o liberar el puerto en uso.

```bash
npm run dev -- --hostname 127.0.0.1 --port 3001
```

### 5) Error de Turbopack en desarrollo

Solucion aplicada: usar webpack en script `dev`.

## Criterios de calidad aplicados

- separacion por responsabilidades (`app`, `api`, `lib`)
- validaciones basicas en endpoints
- manejo de errores y respuestas HTTP coherentes
- uso de variables de entorno para secretos
- esquema relacional con restricciones para reservas

## Mejoras futuras

- pruebas unitarias e integracion
- documentacion de arquitectura con diagramas
- migracion a Postgres para entorno productivo
- pipeline CI/CD para build, lint y tests

## Autor

Proyecto academico para prueba de desempeno.
