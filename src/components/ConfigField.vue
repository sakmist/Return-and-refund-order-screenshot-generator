<script setup>
import { computed } from 'vue'
import { inputAttrs, isTextarea } from '@/utils/field'

const props = defineProps({
  field: { type: Object, required: true },
  modelValue: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue', 'autofill'])

const asTextarea = computed(() => isTextarea(props.field))
const attrs = computed(() => inputAttrs(props.field))
const helperText = computed(() => props.field.clipboardHelper?.buttonText || '粘贴自动填')
const inputId = computed(() => `field-${props.field.id}`)

function onInput(event) {
  emit('update:modelValue', event.target.value)
}
</script>

<template>
  <div class="mb-4">
    <label :for="inputId" class="block text-gray-700 mb-2">{{ field.label }}</label>

    <div v-if="field.clipboardHelper" class="flex gap-2">
      <textarea
        v-if="asTextarea"
        :id="inputId"
        v-bind="attrs"
        :value="modelValue"
        class="border border-gray-300 w-full p-2 rounded-md flex-1"
        @input="onInput"
      ></textarea>
      <input
        v-else
        :id="inputId"
        v-bind="attrs"
        :value="modelValue"
        class="border border-gray-300 w-full p-2 rounded-md flex-1"
        @input="onInput"
      >
      <button
        type="button"
        class="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium px-3 py-2 rounded-md whitespace-nowrap"
        style="width: auto;"
        @click="emit('autofill', field)"
      >
        {{ helperText }}
      </button>
    </div>

    <textarea
      v-else-if="asTextarea"
      :id="inputId"
      v-bind="attrs"
      :value="modelValue"
      class="border border-gray-300 w-full p-2 rounded-md"
      @input="onInput"
    ></textarea>
    <input
      v-else
      :id="inputId"
      v-bind="attrs"
      :value="modelValue"
      class="border border-gray-300 w-full p-2 rounded-md"
      @input="onInput"
    >
  </div>
</template>
