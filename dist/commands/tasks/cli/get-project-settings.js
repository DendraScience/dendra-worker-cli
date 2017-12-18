'use strict';

module.exports = ({ check, file, projectSettings }) => {
  return {
    check(p) {
      check.assert.assigned(projectSettings.content, 'No den.json file');
      return true;
    },

    execute(p) {
      return Promise.resolve(projectSettings.safeContent).then(res => file.saveJson(res, p, {
        file: 'project-settings.json',
        save: p.file
      }));
    }
  };
};