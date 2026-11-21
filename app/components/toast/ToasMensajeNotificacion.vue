<script setup lang="ts">
import usuariologo from '@images/avatars/usuario.png'

interface UsuarioToast {
  nombre?: string
  apellido?: string
  nombre_completo?: string
  foto_perfil?: string | null
  foto_perfil_sigua?: string | null
}

const props = defineProps<{
  nombre?: string
  titulo?: string
  mensaje?: string
  foto?: string
}>()

console.log('props', props)

const fotoFinal = computed(() => props.foto || usuariologo)
</script>

<template>
  <div class="toast-notificacion">
    <img :src="fotoFinal" class="toast-avatar" alt="Foto de perfil">

    <div class="toast-content">
      <div class="toast-header">
        <span class="toast-nombre">{{ nombre || 'Sistema' }}</span>
        <span class="toast-badge">Nuevo mensaje</span>
      </div>

      <div class="toast-titulo">
        {{ titulo || 'Notificación' }}
      </div>

      <div class="toast-mensaje">
        {{ mensaje || 'Tienes un nuevo mensaje' }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.toast-notificacion {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-width: 320px;
}

.toast-avatar {
  width: 44px;
  height: 44px;
  border-radius: 999px;
  object-fit: cover;
  flex-shrink: 0;
  border: 2px solid rgba(255, 255, 255, 0.08);
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.toast-nombre {
  font-size: 14px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--toast-text);
}

.toast-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
  color: white;
  background: var(--toast-info);
  white-space: nowrap;
}

.toast-titulo {
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 2px;
  color: var(--toast-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.toast-mensaje {
  font-size: 12px;
  line-height: 1.4;
  color: var(--toast-text);
  opacity: 0.82;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
