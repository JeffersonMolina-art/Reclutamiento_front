<script setup lang="ts">
const archivos = defineModel<File[]>({ required: true })

const claveInput = ref(0)

defineExpose({ reiniciar: () => claveInput.value++ })
</script>

<template>
  <VExpansionPanel
    value="curriculum"
    eager
  >
    <VExpansionPanelTitle>
      <VIcon
        icon="tabler-file-cv"
        class="me-2"
      />
      Currículum (obligatorio)
    </VExpansionPanelTitle>
    <VExpansionPanelText>
      <p class="text-body-2 text-medium-emphasis mb-3 pt-2">
        Adjunta un PDF, DOC o DOCX de hasta 5 MB.
      </p>
      <InputFile
        :key="claveInput"
        v-model:archivos="archivos"
        name="cv"
        accept=".pdf,.doc,.docx"
        :max-size-mb="5"
      />
    </VExpansionPanelText>
  </VExpansionPanel>
</template>
