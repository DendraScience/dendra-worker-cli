module.exports = ({projectSettings}) => {
  return {
    execute () {
      return projectSettings.init({
        _comment: 'This is your Dendra Worker CLI project settings file.'
      })
    },

    format (p, res) {
      if (res.created) return `Created: ${projectSettings.filePath}`
      if (res.exists) return `File exists: ${projectSettings.filePath}`
    }
  }
}
