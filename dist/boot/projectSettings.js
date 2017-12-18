'use strict';

const { join } = require('path');
const Settings = require('../lib/Settings');

module.exports = async app => {
  const projectSettings = new Settings(join(process.cwd(), 'den-worker.json'));

  await projectSettings.init();

  app.set('projectSettings', projectSettings);
};