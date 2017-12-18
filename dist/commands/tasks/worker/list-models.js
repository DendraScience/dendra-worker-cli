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
        $select: ['key', 'machineRunning', 'machineStartedAt', 'machineStoppedAt']
      });
    },

    execute(p) {
      return conns.web.app.service('/models').find({ query: p.query }).then(res => file.saveJson(res, p, {
        save: p.file
      }));
    },

    format(p, res) {
      return style.dataTable(res, [{
        name: 'key',
        size: 24
      }, {
        alias: 'run?',
        name: 'machineRunning',
        size: 5
      }, {
        name: 'machineStartedAt',
        size: 18
      }, {
        name: 'machineStoppedAt',
        size: 18
      }], p);
    }
  };
};