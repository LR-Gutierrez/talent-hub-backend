# TalentHub — Backend API

REST API built with [NestJS](https://nestjs.com/), TypeORM, and PostgreSQL.

## Requisitos

- **Node.js** >= 20
- **PostgreSQL** >= 14
- **npm**

## Instalación

```bash
# 1. Clonar el repositorio
git clone <repo-url>
cd backend

# 2. Instalar dependencias
npm install

# 3. Crear la base de datos en PostgreSQL
psql -U postgres -c "CREATE DATABASE talent_hub;"

# 4. Configurar variables de entorno
cp .env.example .env
# Editar .env con las credenciales de tu base de datos

# 5. Iniciar en modo desarrollo
# Las tablas se crean automáticamente (synchronize: true)
# Los seeders (catálogos, usuarios, estados) se ejecutan al iniciar
npm run start:dev
```

El servidor arranca en `http://localhost:3000`.

## Variables de Entorno

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `DB_HOST` | Host de PostgreSQL | `localhost` |
| `DB_PORT` | Puerto de PostgreSQL | `5432` |
| `DB_USERNAME` | Usuario de BD | `postgres` |
| `DB_PASSWORD` | Contraseña de BD | `postgres` |
| `DB_DATABASE` | Nombre de la BD | `talent_hub` |
| `JWT_SECRET` | Secreto para firmar tokens JWT | (requerido) |
| `PORT` | Puerto del servidor | `3000` |

## Scripts

```bash
npm run build       # Compilar a JavaScript
npm run start       # Iniciar en producción
npm run start:dev   # Iniciar con hot-reload
npm run lint        # ESLint + Prettier
npm run test        # Tests unitarios
```

## Seeders

Los siguientes seeders se ejecutan automáticamente al iniciar la aplicación si las tablas están vacías:

- Catálogos (géneros, estados civiles, niveles educativos, grados, tallas uniformes, países, tipos de sangre)
- Estados de empleado
- Usuario administrador por defecto

## Diseño y Desarrollo

Desarrollado originalmente por **Luis Angel Gutiérrez**, Ingeniero en Informática y Desarrollador de Software.

- 🌐 **LinkedIn**: [https://www.linkedin.com/in/lrgutierrez/](https://www.linkedin.com/in/lrgutierrez/)
- 💻 **GitHub**: [https://github.com/LR-Gutierrez](https://github.com/LR-Gutierrez)

## Licencia

Propietario / Uso Comercial Restringido
