export const convertDayId = (date: Date = new Date()): string => {
  const year: number = date.getFullYear()
  const month: number = date.getMonth()
  const day: string = date.getDate().toString().padStart(2, '0')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[month]}${day}${year}`
}