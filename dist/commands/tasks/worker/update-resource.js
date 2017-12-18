"use strict";

module.exports = ({ conns, file }, { resource, servicePath }) => {
  return {
    pre(p) {
      return Object.assign({
        id: p._sliced[0]
      }, p);
    },

    execute(p) {
      return file.loadJson(p, {
        file: p.id && `${p.id}.${resource}.json`
      }).then(data => {
        if (p.id) data._id = p.id;
        return conns.web.app.service(servicePath).update(data._id, data);
      }).then(res => file.saveJson(res, p, {
        file: `${res._id}.${resource}.json`
      }));
    }
  };
};