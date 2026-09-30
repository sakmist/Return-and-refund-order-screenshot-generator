const NAME_KEYWORDS = /(?:收[件貨]人|联系人|聯絡人|姓名)/i
const PHONE_KEYWORDS = /(?:电话|手機|手机|联系方式|聯絡電話|Tel)/i
const ADDRESS_KEYWORDS = /(?:返厂地址|退货地址|收货地址|寄件地址|详细地址|地址)/i
const STOP_WORDS = /^(备注|請|请|如有|若有|您|麻烦|寄出|记得|快递|留言|单号|谢谢)/
const LOOSE_PHONE = /(1\d{10})/

function stripKeywordPrefix(text, regex) {
  if (!text) {
    return ''
  }
  const pattern = new RegExp(`^(?:${regex.source})[:：\\s]*`, 'i')
  return text.replace(pattern, '').trim()
}

function parseCombinedLine(line) {
  if (!line) {
    return null
  }
  const trimmed = line.trim()
  if (!trimmed) {
    return null
  }
  const phoneMatch = trimmed.match(LOOSE_PHONE)
  if (!phoneMatch) {
    return null
  }
  const phone = phoneMatch[1]
  const beforeRaw = trimmed.slice(0, phoneMatch.index).replace(/[,，]/g, ' ').trim()
  const afterRaw = trimmed.slice(phoneMatch.index + phone.length).replace(/^[,，]/, '').trim()
  let name = stripKeywordPrefix(beforeRaw, NAME_KEYWORDS)
  if (!name) {
    const nameTokens = beforeRaw.split(/[\s]+/).filter(Boolean)
    name = nameTokens.length ? nameTokens[nameTokens.length - 1] : ''
  }
  let address = stripKeywordPrefix(afterRaw, ADDRESS_KEYWORDS)
  if (!address) {
    address = afterRaw
  }
  return { name, phone, address }
}

function extractCombinedContact(lines) {
  for (const line of lines) {
    const parsed = parseCombinedLine(line)
    if (parsed) {
      return parsed
    }
  }
  return null
}

function normalizeLines(text) {
  return text
    .replace(/\r/g, '\n')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
}

/**
 * 从一段自由文本中解析出姓名、电话和地址。
 * 支持「收货人：张三 13812345678」这类合并写法，也支持逐行带标签的写法。
 */
export function parseAddressText(raw) {
  if (!raw) {
    return { name: '', phone: '', address: '' }
  }
  const lines = normalizeLines(raw)
  if (!lines.length) {
    return { name: '', phone: '', address: '' }
  }

  const combined = extractCombinedContact(lines) || {}
  let phone = combined.phone || ''
  let name = combined.name || ''
  let address = combined.address || ''

  lines.forEach(line => {
    if (!phone) {
      const labelled = line.match(new RegExp(`${PHONE_KEYWORDS.source}[:：]*\\s*(1\\d{10})`, 'i'))
      phone = labelled && labelled[1] ? labelled[1] : ''
    }
    if (!phone) {
      const loose = line.match(LOOSE_PHONE)
      phone = loose ? loose[1] : ''
    }
    if (!name) {
      const labelled = line.match(new RegExp(`${NAME_KEYWORDS.source}[:：]*\\s*([^\\s,，]+)`, 'i'))
      name = labelled && labelled[1] ? labelled[1].trim() : ''
    }
    if (!address && ADDRESS_KEYWORDS.test(line)) {
      const value = line.split(/[:：]/).slice(1).join(':').trim() ||
        line.replace(ADDRESS_KEYWORDS, '').replace(/[:：]/g, '').trim()
      address = value
    }
  })

  if (!address) {
    for (let i = 0; i < lines.length; i += 1) {
      if (ADDRESS_KEYWORDS.test(lines[i])) {
        let collected = lines[i].split(/[:：]/).slice(1).join(':').trim()
        if (!collected) {
          collected = lines[i].replace(ADDRESS_KEYWORDS, '').replace(/[:：]/g, '').trim()
        }
        for (let j = i + 1; j < lines.length; j += 1) {
          const next = lines[j]
          if (ADDRESS_KEYWORDS.test(next) || NAME_KEYWORDS.test(next) || PHONE_KEYWORDS.test(next) || STOP_WORDS.test(next)) {
            break
          }
          collected += ` ${next}`
        }
        address = collected.trim()
        break
      }
    }
  }

  if (!name) {
    const firstTokens = lines[0].split(/[\s,，]+/).filter(Boolean)
    if (firstTokens.length) {
      name = firstTokens[0]
    }
  }

  const containsPhone = line => {
    if (!line) {
      return false
    }
    if (phone && line.includes(phone)) {
      return true
    }
    return LOOSE_PHONE.test(line)
  }

  if (!address) {
    const reversed = [...lines].reverse()
    const candidate = reversed.find(line =>
      line.length > 8 &&
      !NAME_KEYWORDS.test(line) &&
      !PHONE_KEYWORDS.test(line) &&
      !containsPhone(line),
    )
    if (candidate) {
      address = candidate
    } else {
      const fallback = reversed.find(line => !containsPhone(line))
      address = fallback || lines[lines.length - 1]
    }
  }

  return { name, phone, address }
}
