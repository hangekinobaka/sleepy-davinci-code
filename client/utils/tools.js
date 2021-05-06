export const timeOut = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}