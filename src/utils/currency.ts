export const formatVND = (amount: number) => {
  try {
    const n = Math.round(Number(amount) || 0)
    const withCommas = new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
      useGrouping: true,
    }).format(n)
    return `${withCommas} đ`
  } catch {
    const n = Math.round(Number(amount) || 0)
    return `${n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} đ`
  }
}
