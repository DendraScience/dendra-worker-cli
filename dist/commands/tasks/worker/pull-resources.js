'use strict';

const path = require('path');
const ProgressBar = require('progress');

module.exports = ({ conns, file, parse, style, utils }, { resource, servicePath, title }) => {
  return {
    pre(p) {
      return Object.assign({
        query: p._sliced[0]
      }, p);
    },

    beforeExecute(p) {
      parse.queryArgs(p, null, {
        $select: ['_id']
      });
    },

    async execute(p) {
      const findRes = await conns.web.app.service(servicePath).find({ query: p.query });
      const suffix = `.${resource}.json`;
      const output = [];

      if (p.verbose && p.query) {
        output.push({ query: p.query });
        output.push(style.EMPTY);
      }

      if (!findRes.data) throw new Error('No data');
      if (!findRes.data.length) output.push('No items found');

      const bar = new ProgressBar(`Downloading ${title.toLowerCase()} [:bar] :current/:total`, {
        complete: '=',
        incomplete: ' ',
        renderThrottle: 0,
        stream: process.stdout,
        total: findRes.data.length,
        width: 20
      });

      for (let item of findRes.data) {
        const fn = path.join(p.dir || '', `${item._id}${suffix}`);

        bar.tick({ fn });

        await utils.sleep();

        const res = await conns.web.app.service(servicePath).get(item._id);

        if (p.dry_run) {
          output.push([{ text: 'Will save', tail: ':' }, fn]);
        } else {
          const out = await file.saveJson(res, p, null, {
            file: fn,
            save: true
          });
          if (p.verbose && Array.isArray(out)) output.push(...out);
        }
      }

      output.push(style.EMPTY);
      output.push('Done!');

      return output;
    }
  };
};