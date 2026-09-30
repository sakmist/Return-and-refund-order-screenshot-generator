<script setup>
import ConfigField from './ConfigField.vue'

defineProps({
  fields: { type: Array, default: () => [] },
  values: { type: Object, required: true },
  isCapturing: { type: Boolean, default: false },
  message: { type: String, default: '' },
})

const emit = defineEmits(['generate', 'autofill', 'update:field'])
</script>

<template>
  <div class="sidebar">
    <div class="sidebar-card">
      <button
        id="generatePic"
        type="button"
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded disabled:opacity-70"
        :disabled="isCapturing"
        @click="emit('generate')"
      >
        {{ isCapturing ? '生成中...' : '生成截图' }}
      </button>
    </div>

    <div class="sidebar-card sidebar-form">
      <template v-if="fields.length">
        <ConfigField
          v-for="field in fields"
          :key="field.id"
          :field="field"
          :model-value="values[field.id] ?? ''"
          @update:model-value="emit('update:field', { id: field.id, value: $event })"
          @autofill="emit('autofill', $event)"
        />
      </template>
      <div v-else class="text-sm text-gray-500">
        {{ message }}
      </div>
    </div>
  </div>
</template>
