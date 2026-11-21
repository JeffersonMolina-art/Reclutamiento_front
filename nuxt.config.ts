import { fileURLToPath } from 'node:url'
import svgLoader from 'vite-svg-loader'
import { staticPrimaryColor } from './app/plugins/vuetify/theme'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-04-17',

  app: {
    head: {
      titleTemplate: '%s - Reclutamiento',
      title: 'RRHH',

      link: [{
        rel: 'icon',
        type: 'image/x-icon',
        href: '/logoGuayacan.svg',
      }],
    },
  },

  ssr: false,

  pwa: {
    registerType: 'prompt',

    includeAssets: [
      'guayacan_static.svg',
      'favicon.ico',
      'apple-touch-icon-180x180.png',
    ],

    client: {
      installPrompt: true,
      registerPlugin: true,
      periodicSyncForUpdates: 60,
    },

    manifest: {
      id: '/',
      name: 'Créditos Guayacán',
      short_name: 'GuayCredit',
      description: 'Gestión de créditos de Cooperativa Guayacán R.L.',
      lang: 'es-GT',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      orientation: 'any',

      background_color: 'staticPrimaryColor',
      theme_color: staticPrimaryColor,

      launch_handler: {
        client_mode: 'navigate-new',
      },

      icons: [
        {
          src: '/pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: '/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: '/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
    },

    workbox: {
      globPatterns: [
        '**/*.{js,css,html,ico,png,svg,woff2}',
      ],
      cleanupOutdatedCaches: true,
      maximumFileSizeToCacheInBytes: 4194304,
      navigateFallback: '/',
      navigateFallbackDenylist: [/^\/api\//, /^\/services\//],

      runtimeCaching: [
        {
          urlPattern: /\/(services\/)?api\/.*/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'guayacan-api-cache',
            networkTimeoutSeconds: 10,
            fetchOptions: {
              mode: 'cors',
              credentials: 'include',
            },
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24, // 1 día
            },
            cacheableResponse: {
              statuses: [0, 200, 201, 204],
            },
            plugins: [
              {
                cacheWillUpdate: async ({ response }) => {
                  // Si la respuesta es exitosa, la forzamos a guardarse en caché
                  if (response && (response.status === 200 || response.status === 201))
                    return response

                  return null
                },
              },
            ],
          },
        },
      ],
    },

    devOptions: {
      enabled: true,
      type: 'module',
    },
  },

  runtimeConfig: {
    AUTH_ORIGIN: process.env.AUTH_ORIGIN,
    AUTH_SECRET: process.env.AUTH_SECRET,

    oauth: {
      microsoft: {
        clientId: process.env.NUXT_OAUTH_MICROSOFT_CLIENT_ID,
        clientSecret: process.env.NUXT_OAUTH_MICROSOFT_CLIENT_SECRET,
        tenant: process.env.NUXT_OAUTH_MICROSOFT_TENANT,
      },
    },

    public: {
      entorno: process.env.APP_ENV || 'local',
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'api',
      appUrl: process.env.APP_URL || 'http://localhost:3000/',

      REVERB_APP_ID: process.env.REVERB_APP_ID,
      REVERB_APP_KEY: process.env.REVERB_APP_KEY,
      REVERB_HOST: process.env.REVERB_HOST?.replace(/\/$/, ''),
      REVERB_PORT: process.env.REVERB_PORT || '',
      REVERB_SCHEME: process.env.REVERB_SCHEME?.replace(':', '') || 'http',
      REVERB_PATH: process.env.REVERB_PATH || '/app',
      mapsKey: process.env.MAPS_KEY,
    },
  },

  sanctum: {
    mode: 'token',
    baseUrl: '/services',
    userStateKey: 'sanctum.user.identity',
    redirectIfAuthenticated: true,
    redirectIfUnauthenticated: true,
    endpoints: {
      logout: '/api/auth/logout',
      user: '/api/user',
    },
    csrf: {
      cookie: 'XSRF-TOKEN',
      header: 'X-XSRF-TOKEN',
    },
    client: {
      retry: false,
    },
    redirect: {
      keepRequestedRoute: false,
      onLogin: '/',
      onLogout: '/login',
      onAuthOnly: '/login',
      onGuestOnly: '/',
    },
    globalMiddleware: {
      enabled: true,
    },
    logLevel: 3,
  },

  devtools: {
    enabled: true,
  },

  css: [
    '@core/scss/template/libs/vuetify/index.scss',
    '@core/scss/template/index.scss',
    '@styles/styles.scss',
    '@/plugins/iconify/icons.css',
  ],

  components: {
    dirs: [{
      path: '@/@core/components',
      pathPrefix: false,
    }, {
      path: '~/components/global',
      global: true,
    }, {
      path: '~/components',
      pathPrefix: false,
    }],
  },

  plugins: ['@/plugins/vuetify/index.ts', '@/plugins/iconify/index.ts', '@/plugins/casl/index.ts'],

  imports: {
    dirs: [
      './@core/utils',
      './@core/composable/',
      './plugins/*/composables/*',
      './utils/helpers/*.ts',
    ],
  },

  future: {
    compatibilityVersion: 4,
  },

  experimental: {
    typedPages: true,

    appManifest: true,
    checkOutdatedBuildInterval: 60000,
  },

  typescript: {
    tsConfig: {
      compilerOptions: {
        paths: {
          '@/*': ['./app/*'],
          '@themeConfig': ['./themeConfig.ts'],
          '@layouts/*': ['./app/@layouts/*'],
          '@layouts': ['./app/@layouts'],
          '@core/*': ['./app/@core/*'],
          '@core': ['./app/@core'],
          '@images/*': ['./app/assets/images/*'],
          '@styles/*': ['./app/assets/styles/*'],
          '@validators': ['./app/@core/utils/validators'],
          '@db/*': ['./server/fake-db/*'],
          '@api-utils/*': ['./server/utils/*'],
        },
      },
    },
  },

  sourcemap: {
    server: false,
    client: false,
  },

  vue: {
    compilerOptions: {
      isCustomElement: tag => tag === 'swiper-container' || tag === 'swiper-slide',
    },
  },

  vite: {
    css: {
      devSourcemap: false,
      preprocessorMaxWorkers: true,
    },

    server: {
      warmup: {
        clientFiles: [
          './@core/scss/template/index.scss',
          './assets/styles/styles.scss',
          './pages/**/*.vue',
          './layouts/**/*.vue',
          './components/**/*.vue',
          './views/**/*.vue',
        ],
      },
    },

    define: { 'process.env': {} },

    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./app', import.meta.url)),
        '@themeConfig': fileURLToPath(new URL('./themeConfig.ts', import.meta.url)),
        '@core': fileURLToPath(new URL('./app/@core', import.meta.url)),
        '@layouts': fileURLToPath(new URL('./app/@layouts', import.meta.url)),
        '@images': fileURLToPath(new URL('./app/assets/images/', import.meta.url)),
        '@styles': fileURLToPath(new URL('./app/assets/styles/', import.meta.url)),
        '@configured-variables': fileURLToPath(
          new URL('./app/assets/styles/variables/_template.scss', import.meta.url),
        ),
        '@db': fileURLToPath(new URL('./server/fake-db/', import.meta.url)),
        '@api-utils': fileURLToPath(
          new URL('./server/utils/', import.meta.url),
        ),
      },
    },

    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        external: ['jiti', '@humanfs/node'],
      },
    },

    optimizeDeps: {
      include: [
        'pinia',
        'axios',
        '@casl/ability',
        '@casl/vue',
        'laravel-echo',
        'pusher-js',
        'sweetalert2',
        'overlayscrollbars',
        'overlayscrollbars-vue',
        '@floating-ui/dom',
        'webfontloader',
        '@formkit/drag-and-drop',
        '@tiptap/vue-3',
        '@tiptap/starter-kit',
        '@tiptap/extension-highlight',
        '@tiptap/extension-image',
        '@tiptap/extension-link',
        '@tiptap/extension-text-align',
        'apexcharts',
        'vue3-apexcharts',
        'vue-chartjs',
        'chart.js',
        'vue-flatpickr-component',
        'swiper',
        'sortablejs',
        'jspdf',
        'jspdf-autotable',
        'date-fns',
        'jwt-decode',
        'js-cookie',
        'prismjs',
        'vue-prism-component',
        'shepherd.js',
        '@vueuse/core',
        '@vueuse/math',
        '@tiptap/core',
        'xlsx',
        '@antfu/utils',
        'vuetify',
        'vuetify/components',
        'vuetify/directives',
        '@vue/devtools-core',
        '@vue/devtools-kit',
        '@iconify/vue',
      ],
    },

    plugins: [svgLoader()],
  },

  vuetify: {
    moduleOptions: {
      styles: {
        configFile: 'assets/styles/variables/_vuetify.scss',
      },
    },
    vuetifyOptions: './vuetify.config.ts',
  },

  build: {
    transpile: ['vuetify'],
  },

  modules: [
    '@vite-pwa/nuxt',
    'vuetify-nuxt-module',
    '@vueuse/nuxt',
    '@nuxtjs/device',
    '@pinia/nuxt',
    'nuxt-auth-sanctum',
  ],
})
