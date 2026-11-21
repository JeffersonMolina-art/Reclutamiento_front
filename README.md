# Reclutamiento Front

Frontend de Reclutamiento construido con **Nuxt 4** (modo SPA, `ssr: false`), **Vue 3**, **Vuetify** y **Pinia**. Se conecta a una API Laravel (Sanctum) y a Laravel Reverb para tiempo real. Soporta modo offline (Dexie/IndexedDB) y empaquetado móvil con Capacitor.

## Requisitos previos

| Herramienta | Versión |
|---|---|
| Node.js | LTS (ver `.nvmrc`) |
| pnpm | 9.15.0 (definido en `packageManager`) |
| Git | Cualquiera reciente |
| Backend Laravel | API corriendo y accesible |
| Android Studio | Solo si se compilará la app móvil |

Activar pnpm:

```sh
corepack enable
corepack prepare pnpm@9.15.0 --activate
```

## 1. Instalación

```sh
git clone https://github.com/JeffersonMolina-art/Reclutamiento_front.git
cd Reclutamiento_front
pnpm install
```

`pnpm install` ejecuta automáticamente `nuxt prepare` y `build:icons` (postinstall).

## 2. Configuración del entorno

Copiar el archivo de ejemplo y completarlo:

```sh
copy .env.example .env      # Windows
# cp .env.example .env      # Linux/Mac
```

Variables principales:

| Variable | Descripción |
|---|---|
| `NUXT_PUBLIC_API_BASE_URL` | URL base de la API Laravel (por defecto `api`) |
| `NUXT_PUBLIC_API_BASE_URL_MOVIL` | URL de la API usada por la app móvil |
| `NUXT_PUBLIC_API_BASE_URL_SIGUA` | URL de la API SIGUA |
| `APP_ENV` | Entorno: `local`, `produccion`, etc. |
| `APP_URL` | URL del frontend (por defecto `http://localhost:3000/`) |
| `REVERB_APP_ID`, `REVERB_APP_KEY` | Credenciales de Laravel Reverb |
| `REVERB_HOST`, `REVERB_PORT`, `REVERB_SCHEME` | Host, puerto y esquema (`http`/`https`) de Reverb |
| `HOSTS_PERMITIDOS_API` | Hosts permitidos para la API |
| `NUXT_INTERNAL_SECRET` | Secreto interno del servidor Nuxt |
| `MAPS_KEY` | Clave de mapas (Mapbox) |

> No subir el archivo `.env` al repositorio.

## 3. Servicios que deben estar encendidos

1. **Base de datos** y **backend Laravel** (por ejemplo con Laragon: iniciar Apache/Nginx y MySQL).
2. **Laravel Reverb** (WebSockets), en la carpeta del backend:
   ```sh
   php artisan reverb:start
   ```
3. Opcional, según el backend: `php artisan queue:work`.

## 4. Desarrollo

```sh
pnpm dev
```

Disponible en <http://localhost:3000>.

Si aparece el error `The service was stopped: write EPIPE`, detener el servidor y limpiar caché:

```powershell
Remove-Item -Recurse -Force .nuxt, node_modules\.vite -ErrorAction SilentlyContinue
pnpm dev
```

## 5. Despliegue a producción

Es una SPA, por lo que se genera un sitio estático:

```sh
pnpm generate
```

El resultado queda en `.output/public`. Publicarlo en cualquier servidor web (Nginx, Apache, IIS) apuntando a esa carpeta y redirigiendo todas las rutas a `index.html`.

Ejemplo Nginx:

```nginx
server {
  listen 80;
  server_name midominio.com;
  root /ruta/.output/public;
  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

Las variables de `.env` se incorporan en tiempo de compilación, así que deben definirse **antes** de ejecutar `pnpm generate`.

Alternativa con servidor Node:

```sh
pnpm build
node .output/server/index.mjs
```

## 6. App móvil (Capacitor)

```sh
pnpm generate
npx cap add android      # solo la primera vez
npx cap sync android
npx cap open android     # abre Android Studio para compilar
```

## 7. Otros comandos

| Comando | Acción |
|---|---|
| `pnpm lint` | Revisa y corrige el código con ESLint |
| `pnpm build:icons` | Regenera los íconos |
| `pnpm make:crud` | Generador de CRUD (v3) |
| `pnpm generarCrud` | Generador de CRUD (anterior) |

## Estructura

```
app/         Código fuente (pages, components, composables, stores, utils)
  utils/offline/   Base de datos local Dexie (modo offline)
server/      Utilidades del servidor Nuxt
commands/    Generadores de CRUD
public/      Archivos estáticos
```
