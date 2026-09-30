export function inputTag(field) {
  if (field?.inputTag) {
    return field.inputTag
  }
  return field?.inputType === 'textarea' ? 'textarea' : 'input'
}

export function isTextarea(field) {
  return inputTag(field) === 'textarea'
}

export function inputAttrs(field) {
  const attrs = {}
  if (!field) {
    return attrs
  }
  const tag = inputTag(field)
  if (field.placeholder) {
    attrs.placeholder = field.placeholder
  }
  if (field.rows && tag === 'textarea') {
    attrs.rows = field.rows
  }
  if (field.maxLength) {
    attrs.maxlength = field.maxLength
  }
  if (field.inputAttrs && typeof field.inputAttrs === 'object') {
    Object.assign(attrs, field.inputAttrs)
  }
  if (tag !== 'textarea') {
    attrs.type = field.inputType || 'text'
  }
  return attrs
}
