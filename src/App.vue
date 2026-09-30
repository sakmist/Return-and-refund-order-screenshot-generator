<script setup>
import { computed, onMounted, ref } from 'vue'
import ControlPanel from './components/ControlPanel.vue'
import PreviewScreen from './components/PreviewScreen.vue'
import { useClipboardAutofill } from '@/composables/useClipboardAutofill'
import { useOrderConfig } from '@/composables/useOrderConfig'
import { useScreenshot } from '@/composables/useScreenshot'

const { fields, layers, values, configError, loadConfig, resolveLayerText } = useOrderConfig()
const { fillFromClipboard } = useClipboardAutofill(values)
const { isCapturing, capture } = useScreenshot()

const previewRef = ref(null)

const message = computed(() => configError.value || '配置加载中...')

async function handleGenerate() {
  try {
    await capture(previewRef.value?.element)
  } catch (error) {
    console.error('截图失败', error)
    window.alert('生成截图失败，请重试')
  }
}

function handleAutofill(field) {
  fillFromClipboard(field)
}

function handleFieldUpdate({ id, value }) {
  values[id] = value
}

onMounted(loadConfig)
</script>

<template>
  <div class="max-w-5xl mx-auto px-10 flex flex-col gap-10">
    <div class="space-y-2">
      <h1 class="text-3xl font-bold tracking-tight text-slate-900">拼多多退货退款截图生成器</h1>
      <p class="text-sm text-slate-500">仅用于学习排版，请勿伪造或误导他人，寄件信息需与快递真实一致。</p>
    </div>

    <div class="builder-layout flex justify-between items-start gap-10">
      <PreviewScreen
        ref="previewRef"
        :layers="layers"
        :resolve-layer-text="resolveLayerText"
        :message="message"
      />
      <ControlPanel
        :fields="fields"
        :values="values"
        :is-capturing="isCapturing"
        :message="message"
        @generate="handleGenerate"
        @autofill="handleAutofill"
        @update:field="handleFieldUpdate"
      />
    </div>
  </div>
</template>
