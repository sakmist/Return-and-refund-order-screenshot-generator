<script setup>
import { provide, ref } from 'vue'
import LayerNode from './LayerNode.vue'

const props = defineProps({
  layers: { type: Array, default: () => [] },
  resolveLayerText: { type: Function, required: true },
  message: { type: String, default: '' },
})

provide('resolveLayerText', layer => props.resolveLayerText(layer))

const screenRef = ref(null)

function layerKey(layer, index) {
  return layer?.id || layer?.fieldId || `layer-${index}`
}

defineExpose({ element: screenRef })
</script>

<template>
  <div ref="screenRef" class="order-screen">
    <template v-if="layers.length">
      <LayerNode
        v-for="(layer, index) in layers"
        :key="layerKey(layer, index)"
        :layer="layer"
      />
    </template>
    <div v-else class="p-6 text-center text-sm text-slate-500">
      {{ message }}
    </div>
  </div>
</template>
