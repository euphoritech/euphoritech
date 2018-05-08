export default {
  titleCase(string) {
    return string.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
  },

  truncateString(str, length=200) {
    if (str) {
      if (str.length > length)
        return `${(str || '').slice(0, length)} ...`
      return str
    }
    return ''
  },

  unserialize(string) {
    string = (/^\?/.test(string)) ? string.substring(1) : string
    const a = string.split("&")
    let obj = {}
    for (let _i = 0; _i < a.length; _i++) {
      var _a = a[_i].split("=")
      obj[ decodeURIComponent(_a[0]) ] = decodeURIComponent(_a[1])
    }
    return obj
  }
}
