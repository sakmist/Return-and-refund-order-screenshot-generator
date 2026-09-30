import { ref } from 'vue'
import { domToPng } from 'modern-screenshot'

/**
 * 把传入的 DOM 节点渲染成 PNG 并触发下载。
 * 失败时抛出异常，由调用方决定提示方式。
 *
 * 这里刻意不用 html2canvas：它会自己重排文字，中文行内基线按约 1.5em 估算，
 * 与浏览器实际的行盒基线（半行距 + 字体 ascent）差约 0.5em，抓图里的文字会整体
 * 下移约 10px，压到背景图上「商家地址」那一行。modern-screenshot 走 SVG
 * foreignObject，由浏览器栅格化真实 DOM，文字位置与预览一致。
 */
export function useScreenshot() {
  const isCapturing = ref(false)

  async function capture(target, { filename } = {}) {
    if (isCapturing.value) {
      return null
    }
    if (!target) {
      throw new Error('画面节点未找到')
    }

    isCapturing.value = true
    try {
      const scale = Math.max(window.devicePixelRatio || 1, 2)
      const dataUrl = await domToPng(target, { scale })
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = filename || `pdd-return-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      return dataUrl
    } finally {
      isCapturing.value = false
    }
  }

  return { isCapturing, capture }
}
