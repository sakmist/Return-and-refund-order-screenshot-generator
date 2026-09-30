<script setup>
import { computed, inject } from 'vue'

const props = defineProps({
  layer: { type: Object, required: true },
})

const resolveLayerText = inject('resolveLayerText', () => '')

const hasChildren = computed(() => Array.isArray(props.layer.children) && props.layer.children.length > 0)
const text = computed(() => resolveLayerText(props.layer))
</script>

<template>
  <component :is="layer.tag || 'span'" :class="layer.class" :style="layer.style">
    <template v-if="hasChildren">
      <LayerNode
        v-for="(child, index) in layer.children"
        :key="child.id || `${layer.id || 'group'}-child-${index}`"
        :layer="child"
      />
    </template>
    <template v-else>{{ text }}</template>
  </component>
</template>
