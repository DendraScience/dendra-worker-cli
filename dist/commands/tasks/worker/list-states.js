'use strict';

module.exports = ({ conns, file, parse, style }) => {
  return {
    pre(p) {
      return Object.assign({
        query: p._sliced[0]
      }, p);
    },

    beforeExecute(p) {
      parse.queryArgs(p, {
        $select: ['_id', 'created_at', 'updated_at']
      });
    },

    execute(p) {
      return conns.web.app.service('/state/docs').find({ query: p.query }).then(res => file.saveJson(res, p, {
        save: p.file
      }));
    },

    format(p, res) {
      return style.dataTable(res, [{
        name: '_id',
        size: 48
      }, {
        name: 'created_at',
        size: 24
      }, {
        name: 'updated_at',
        size: 24
      }], p);
    }
  };
};