# TalentHub — Backend API

REST API built with [NestJS](https://nestjs.com/), TypeORM, and PostgreSQL.

## Requisitos

- **Node.js** >= 20
- **PostgreSQL** >= 14
- **npm**
- **Docker** (opcional, para despliegue contenerizado)

## Instalación (desarrollo local)

```bash
# 1. Clonar el repositorio
cd backend

# 2. Instalar dependencias
npm install

# 3. Crear la base de datos en PostgreSQL
psql -U postgres -c "CREATE DATABASE talent_hub;"

# 4. Configurar variables de entorno
cp .env.example .env
# Editar .env con las credenciales de tu base de datos

# 5. Iniciar en modo desarrollo
npm run start:dev
```

El servidor arranca en `http://localhost:3000`.

## Despliegue con Docker

```bash
# Levantar backend + PostgreSQL
docker compose up -d

# Opcional: sobreescribir puerto de PostgreSQL si hay conflicto
DB_PORT=5433 docker compose up -d
```

El backend queda en `http://localhost:3000` y PostgreSQL en `localhost:5433` (o el puerto configurado).

## Variables de Entorno

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `DB_HOST` | Host de PostgreSQL | `localhost` |
| `DB_PORT` | Puerto de PostgreSQL | `5432` |
| `DB_USERNAME` | Usuario de BD | `postgres` |
| `DB_PASSWORD` | Contraseña de BD | `123456` |
| `DB_DATABASE` | Nombre de la BD | `talent_hub` |
| `DB_SYNCHRONIZE` | Auto-sincronizar esquema (`true` en dev, `false` en prod) | `true` |
| `JWT_SECRET` | Secreto para firmar tokens JWT | (requerido) |
| `PORT` | Puerto del servidor | `3000` |
| `CORS_ORIGIN` | Orígenes permitidos separados por coma | `http://localhost:5173,http://localhost:3000` |

> **Importante**: En producción, establecer `DB_SYNCHRONIZE=false` y usar migraciones.

## Scripts

```bash
npm run build                  # Compilar a JavaScript
npm run start                  # Iniciar en producción
npm run start:dev              # Iniciar con hot-reload
npm run start:prod             # Iniciar build compilado (node dist/main)
npm run key:generate           # Generar un nuevo JWT_SECRET en .env
npm run lint                   # ESLint + Prettier

# Migraciones (requiere DB_SYNCHRONIZE=false)
npm run migration:generate     # Generar nueva migración
npm run migration:run          # Ejecutar migraciones pendientes
npm run migration:revert       # Revertir última migración

npm run test                   # Tests unitarios
```

## Migraciones

Para usar migraciones en lugar de `synchronize`:

```bash
# 1. Asegurar que dist/ está actualizado
npm run build

# 2. Generar migración inicial (compara entidades compiladas con la BD)
npm run migration:generate -- src/migrations/Initial

# 3. Compilar la migración y ejecutarla
npm run migration:run

# 4. En .env o docker-compose, poner DB_SYNCHRONIZE=false
```

> La configuración de migraciones está en `data-source.js` en la raíz del proyecto.
> Las migraciones se generan como `.ts` en `src/migrations/` y se compilan a `dist/migrations/`.

## Seeders

Los siguientes seeders se ejecutan automáticamente al iniciar la aplicación si las tablas están vacías:

- Catálogos (géneros, estados civiles, niveles educativos, grados, tallas uniformes, países, tipos de sangre)
- Estados de empleado
- Usuario administrador por defecto: `admin@local.com` / `123Qwe`

## API Endpoints

### Health Check

```
GET /api/health
```

```json
{ "status": "ok", "timestamp": "2026-07-29T19:00:00.000Z" }
```

## Diseño y Desarrollo

Desarrollado originalmente por **Luis Angel Gutiérrez**, Ingeniero en Informática y Desarrollador de Software.

- 🌐 **LinkedIn**: [https://www.linkedin.com/in/lrgutierrez/](https://www.linkedin.com/in/lrgutierrez/)
- 💻 **GitHub**: [https://github.com/LR-Gutierrez](https://github.com/LR-Gutierrez)

## Licencia

Propietario / Uso Comercial Restringido
