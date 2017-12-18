'use strict';

const ProgressBar = require('progress');
const { promisify } = require('util');
const glob = promisify(require('glob'));

module.exports = ({ conns, file, style, utils, valid }, { resource, servicePath, title }) => {
  return {
    check(p) {
      if (!p._sliced.length) valid.string(p, 'filespec');
      return true;
    },

    async execute(p) {
      const files = p._sliced.length ? p._sliced : await glob(p.filespec, {
        nodir: true
      });
      const suffix = `.${resource}.json`;
      const output = [];

      if (!(files && files.length)) output.push('No files found');

      const bar = new ProgressBar(`Uploading ${title.toLowerCase()} [:bar] :current/:total`, {
        complete: '=',
        incomplete: ' ',
        renderThrottle: 0,
        stream: process.stdout,
        total: files.length,
        width: 20
      });

      for (let fn of files) {
        let skip;
        let data;
        let res;

        bar.tick({ fn });

        await utils.sleep();

        if (!(p.any_suffix || fn.endsWith(suffix))) skip = true;

        if (!skip) {
          try {
            data = await file.loadJson({
              file: fn
            });
          } catch (e) {
            if (e.code !== 'EISDIR') {
              bar.terminate();
              throw e;
            }
            skip = true;
          }
        }

        if (!skip && data._id) {
          try {
            if (p.only === 'create') {
              res = await conns.web.app.service(servicePath).get(data._id);
              skip = true;
            } else if (p.dry_run) {
              res = await conns.web.app.service(servicePath).get(data._id);
              output.push([{ text: 'Will update', tail: ':' }, fn]);
            } else {
              res = await conns.web.app.service(servicePath).update(data._id, data);
              if (p.verbose) output.push([{ text: 'Updated', tail: ':' }, fn]);
            }
          } catch (e) {
            if (e.code !== 404) {
              bar.terminate();
              throw e;
            }
          }
        }

        if (!skip && !res) {
          if (p.only === 'update') {
            skip = true;
          } else if (p.dry_run) {
            res = data;
            output.push([{ text: 'Will create', tail: ':', bold: true }, { text: fn, bold: true }]);
          } else {
            res = await conns.web.app.service(servicePath).create(data);
            if (p.verbose) output.push([{ text: 'Created', tail: ':', bold: true }, { text: fn, bold: true }]);
          }
        }

        if (!skip && res && p.save) {
          if (p.dry_run) {
            output.push([{ text: 'Will save', tail: ':' }, fn]);
          } else {
            const out = await file.saveJson(res, p, null, {
              file: fn
            });
            if (p.verbose && Array.isArray(out)) output.push(...out);
          }
        }

        if (skip) {
          if (p.dry_run) output.push([{ text: 'Will skip', tail: ':', dim: true }, { text: fn, dim: true }]);else if (p.verbose) output.push([{ text: 'Skipped', tail: ':', dim: true }, { text: fn, dim: true }]);
        }
      }

      output.push(style.EMPTY);
      output.push('Done!');

      return output;
    }
  };
};