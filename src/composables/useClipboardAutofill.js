import { parseAddressText } from '@/utils/address'

async function readClipboardText() {
  if (navigator.clipboard && navigator.clipboard.readText) {
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        return text
      }
    } catch (error) {
      console.warn('读取剪贴板失败，使用手动输入', error)
    }
  }
  return window.prompt('粘贴包含姓名、电话、地址的信息：') || ''
}

/**
 * 读取剪贴板（不可用时回退到手动输入），解析出联系人信息并写回表单值。
 */
export function useClipboardAutofill(values) {
  async function fillFromClipboard(field) {
    if (!field) {
      return false
    }
    const text = await readClipboardText()
    if (!text) {
      return false
    }

    const helper = field.clipboardHelper || {}
    const parsed = parseAddressText(text)

    const contactFieldId = helper.contactFieldId || field.id
    if (contactFieldId) {
      const contact = [parsed.name, parsed.phone].filter(Boolean).join(' ').trim()
      if (contact) {
        values[contactFieldId] = contact
      }
    }
    if (helper.addressFieldId && parsed.address) {
      values[helper.addressFieldId] = parsed.address
    }
    return true
  }

  return { fillFromClipboard }
}
