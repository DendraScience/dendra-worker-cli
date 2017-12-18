const {homedir} = require('os')
const {join} = require('path')
const Settings = require('../lib/Settings')

module.exports = async (app) => {
  const userSettings = new Settings(join(homedir(), '.den-worker', 'settings.json'), {
    privateFields: [
      'tokens'
    ]
  })

  await userSettings.init({
    _comment: 'This is your Dendra Worker CLI user settings file.',
    environment: 'preview'
  })

  app.set('userSettings', userSettings)
}
