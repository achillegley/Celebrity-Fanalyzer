export function shortMonthDay(timestamp) {
  const date = timestamp ? new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000) : new Date()

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) // Nov 2
}

export function shortMonthDayTime(timestamp) {
  const date = timestamp ? new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000) : new Date()

  return date
    .toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: false })
    .split(', ')
    .join(' - ') // Dec 10 - 14:18
}

export function yearMonth() {
  return new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit' }).split('/').reverse().join('-') // 2022-11
}
