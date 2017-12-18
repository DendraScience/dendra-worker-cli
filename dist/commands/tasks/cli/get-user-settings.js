'use strict';

module.exports = ({ file, userSettings }) => {
  return {
    execute(p) {
      return Promise.resolve(userSettings.safeContent).then(res => file.saveJson(res, p, {
        file: 'user-settings.json',
        save: p.file
      }));
    }
  };
};