'use strict';

/**
 * Meta remove helpers.
 *
 * @author J. Scott Smith
 * @license BSD-2-Clause-FreeBSD
 * @module meta/_remove
 */

async function removeOne({ conns, file }, { id, output, override, p, resource, servicePath }, cb) {
  if (cb) cb(id);
  let res = await conns.web.app.service(servicePath).remove(id);

  if (p.verbose) output.push([{ text: 'Removed', tail: ':', bold: true }, { text: resource, bold: true }, { text: res._id, bold: true }]);

  const out = await file.saveJson(res, p, {
    file: `${res._id}.${resource}.json`,
    save: p.file
  }, override);
  if (p.verbose && Array.isArray(out)) output.push(...out);

  return res;
}

exports.removeOne = removeOne;

async function removeMany(ctx, { output, p, query, resource, servicePath }, cb) {
  const { conns } = ctx;
  const $limit = 10;
  const $select = ['_id'];
  let $skip = 0;

  while (true) {
    const findRes = await conns.web.app.service(servicePath).find({ query: Object.assign({}, query, {
        $limit,
        $select,
        $skip
      }) });

    if (!(findRes && findRes.data.length)) break;

    for (let res of findRes.data) {
      await removeOne(ctx, {
        id: res._id,
        output,
        override: {
          file: `${res._id}.${resource}.json`
        },
        p,
        resource,
        servicePath
      }, cb);
    }

    $skip += $limit;
  }
}

exports.removeMany = removeMany;