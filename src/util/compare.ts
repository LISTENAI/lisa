'use strict'

function split(flag: boolean, version: string) {
  version = String(version)
  let result = []
  if (flag) {
    const tail = version.split('-')[1]
    const _version = version.split('-')[0]
    result = _version.split('.')
    const elsetail = tail.split('.')
    result = result.concat(elsetail)
  } else {
    result = version.split('.')
  }
  return result
}

function convertToNumber(arr: Array<any>) {
  return arr.map(function (el) {
    // eslint-disable-next-line radix
    return isNaN(el) ? el : parseInt(el)
  })
}

function compare(v1: string, v2: string) {
  v1 = String(v1)
  v2 = String(v2)

  const flag1 = v1.indexOf('-') > -1
  const flag2 = v2.indexOf('-') > -1
  let arr1 = split(flag1, v1)
  let arr2 = split(flag2, v2)
  arr1 = convertToNumber(arr1)
  arr2 = convertToNumber(arr2)
  const len = Math.max(arr1.length, arr2.length)
  for (let i = 0; i < len; i++) {
    // 1.0.0 > 1.0.0-beta.2
    if (i === 3 && (arr1[i] === undefined || arr2[i] === undefined)) {
      if (arr1[i] === undefined && isNaN((arr2[i] as unknown as number))) {
        return 1
      // eslint-disable-next-line max-statements-per-line
      } if (isNaN(arr1[i] as unknown as number) && arr2[i] === undefined) {
        return -1
      }
    }
    if (arr1[i] === undefined) {
      return -1
    }

    if (arr2[i] === undefined) {
      return 1
    }

    if (arr1[i] > arr2[i]) {
      return 1
    }

    if (arr1[i] < arr2[i]) {
      return -1
    }
  }
  return 0
}

export default compare
