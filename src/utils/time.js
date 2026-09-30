export function pad(value) {
  return value.toString().padStart(2, '0')
}

export function getCurrentTime() {
  const now = new Date()
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`
}
