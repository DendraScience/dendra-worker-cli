module.exports = ({parse, style, userSettings, utils, valid}) => {
  return {
    pre (p) {
      return Object.assign({
        value: p._sliced[0]
      }, p)
    },

    check (p) {
      valid.string(p, 'value')
      return true
    },

    async execute (p) {
      utils.setByDot(userSettings.content, 'environment', p.value)
      await userSettings.save()
      return userSettings.safeContent
    }
  }
}
