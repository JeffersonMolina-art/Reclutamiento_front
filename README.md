# Reclutamiento Front

Interfaz web del sistema de reclutamiento: gestión de vacantes, postulaciones y seguimientos. Consume la API del backend de reclutamiento.

## Stack

- Nuxt 3 / Vue 3
- Vuetify
- pnpm

## Requisitos

- Node.js (versión LTS recomendada)
- pnpm
- API de reclutamiento corriendo (local o remota)

## Instalación

1. Instalar dependencias:

   ```bash
   pnpm install
   ```

2. Construir los íconos:

   ```bash
   pnpm run build:icons
   ```

3. Preparar el entorno:

   ```bash
   cp .env.example .env
   ```

4. Ejecutar en ambiente local:

   ```bash
   pnpm run dev
   ```

## Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `NUXT_PUBLIC_API_BASE_URL` | URL base de la API | `http://localhost:8000` |

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `pnpm run dev` | Servidor de desarrollo |
| `pnpm run build` | Build de producción |
| `pnpm run preview` | Previsualiza el build de producción |
| `pnpm run build:icons` | Regenera los íconos |
