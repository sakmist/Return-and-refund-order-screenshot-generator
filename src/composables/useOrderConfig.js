import { reactive, ref } from 'vue'
import { getCurrentTime } from '@/utils/time'

const CONFIG_URL = `${import.meta.env.BASE_URL}config.json`

/**
 * 加载 config.json 并维护表单值、图层定义与配置错误状态。
 * 图层文本统一通过 resolveLayerText 解析，模板层不再各自拼接。
 */
export function useOrderConfig() {
  const fields = ref([])
  const layers = ref([])
  const values = reactive({})
  const configError = ref('')
  const isLoading = ref(true)

  function applyConfig(config) {
    const nextFields = Array.isArray(config?.fields) ? config.fields : []
    const nextLayers = Array.isArray(config?.layers) ? config.layers : []

    Object.keys(values).forEach(key => {
      delete values[key]
    })

    nextFields.forEach(field => {
      if (!field || !field.id) {
        return
      }
      values[field.id] = field.useCurrentTime ? getCurrentTime() : field.defaultValue ?? ''
    })

    fields.value = nextFields
    layers.value = nextLayers
  }

  async function loadConfig() {
    isLoading.value = true
    try {
      const response = await fetch(CONFIG_URL, { cache: 'no-cache' })
      if (!response.ok) {
        throw new Error(`配置请求失败：${response.status}`)
      }
      applyConfig(await response.json())
      configError.value = ''
    } catch (error) {
      console.error('配置加载失败', error)
      configError.value = '配置加载失败，请刷新后重试'
    } finally {
      isLoading.value = false
    }
  }

  function formatLayerValue(layer) {
    if (!layer || !layer.fieldId) {
      return ''
    }
    const raw = values[layer.fieldId] ?? ''
    return `${layer.prefix || ''}${raw}${layer.suffix || ''}`
  }

  function resolveLayerText(layer) {
    if (!layer) {
      return ''
    }
    return layer.type === 'static' ? layer.text || '' : formatLayerValue(layer)
  }

  return {
    fields,
    layers,
    values,
    configError,
    isLoading,
    loadConfig,
    applyConfig,
    formatLayerValue,
    resolveLayerText,
  }
}
