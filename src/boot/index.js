const userSettings = require('./userSettings')
const projectSettings = require('./projectSettings')

module.exports = async (app) => {
  await userSettings(app)
  await projectSettings(app)

  // TODO: Refactor into MergedSettings class?
  const mergedSettings = {
    content: Object.assign({}, app.get('userSettings').safeContent, app.get('projectSettings').safeContent)
  }

  if (!mergedSettings.content.environment) throw new Error('Workspace environment is undefined')

  app.set('mergedSettings', mergedSettings)
}
