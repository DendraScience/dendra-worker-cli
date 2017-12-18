'use strict';

module.exports = ({ check, parse, projectSettings, style, utils, valid }) => {
  return {
    pre(p) {
      return Object.assign({
        key: p._sliced[0],
        value: p._sliced[1]
      }, p);
    },

    check(p) {
      check.assert.assigned(projectSettings.content, 'No den.json file');
      valid.string(p, 'key');
      return true;
    },

    beforeExecute(p) {
      parse.value(p);
    },

    async execute(p) {
      utils.setByDot(projectSettings.content, p.key, p.value, true);
      await projectSettings.save();
      return projectSettings.safeContent;
    }
  };
};