'use strict';

module.exports = ({ parse, style, userSettings, utils, valid }) => {
  return {
    pre(p) {
      return Object.assign({
        key: p._sliced[0],
        value: p._sliced[1]
      }, p);
    },

    check(p) {
      valid.string(p, 'key');
      return true;
    },

    beforeExecute(p) {
      parse.value(p);
    },

    async execute(p) {
      utils.setByDot(userSettings.content, p.key, p.value, true);
      await userSettings.save();
      return userSettings.safeContent;
    }
  };
};