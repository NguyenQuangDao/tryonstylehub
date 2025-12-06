export const formatVND = (amount: number) => {
  try {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(Math.round(Number(amount) || 0))
  } catch {
    return `${Math.round(Number(amount) || 0)} VND`
  }
}

