'use strict';

module.exports = ({ conns, file, valid }) => {
  return {
    pre(p) {
      return Object.assign({
        id: p._sliced[0]
      }, p);
    },

    check(p) {
      valid.string(p, 'id');
      return true;
    },

    execute(p) {
      return conns.web.app.service('/models').get(p.id).then(res => file.saveJson(res, p, {
        file: `${res.key}.model.json`,
        save: p.file
      }));
    }
  };
};