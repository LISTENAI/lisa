const util = {
  trimSpace: (str: string) => {
    return str
    .replace(/\s+([\u4e00-\u9fa5])/gi, '$1')
    .replace(/([\u4e00-\u9fa5])\s+/gi, '$1')
    .replace(/\s{2,}/g, ' ')
    .replace(/[\r\n]/g, '')
    .trim()
  },
}

export default util
