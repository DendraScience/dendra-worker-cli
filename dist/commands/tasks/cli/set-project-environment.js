'use strict';

module.exports = ({ check, parse, projectSettings, style, utils, valid }) => {
  return {
    pre(p) {
      return Object.assign({
        value: p._sliced[0]
      }, p);
    },

    check(p) {
      check.assert.assigned(projectSettings.content, 'No den.json file');
      valid.string(p, 'value');
      return true;
    },

    async execute(p) {
      utils.setByDot(projectSettings.content, 'environment', p.value);
      await projectSettings.save();
      return projectSettings.safeContent;
    }
  };
};