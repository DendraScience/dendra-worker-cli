'use strict';

/**
 * CLI parsing functions.
 *
 * @author J. Scott Smith
 * @license BSD-2-Clause-FreeBSD
 * @module lib/parse
 */

const moment = require('moment');

const MOMENT_FORMATS = ['M/D/YY', 'M/D/YYTh:mma', 'M/D/YYTh:mm:ssa', 'M/D/YYYY', 'M/D/YYYYTh:mma', 'M/D/YYYYTh:mm:ssa', 'D-M-YY', 'D-M-YYTH:mm', 'D-M-YYTH:mm:ss', 'D-M-YYYY', 'D-M-YYYYTH:mm', 'D-M-YYYYTH:mm:ss', 'YYYY-M-D', 'YYYY-M-DTH:mm', 'YYYY-M-DTH:mm:ss', 'YYYY-M-DTH:mmZ', 'YYYY-M-DTH:mm:ssZ'];
const RESERVED_REGEX = /^(_|_sliced|dir|dry-run|dry_run|file|filespec|limit|output|query|save|sort|sort:asc|sort:desc|verbose)$/;
const BOOL_REGEX = /^(false|true)$/i;

function queryArgs(p, tableOpts, override) {
  let q = p.query;

  /*
    Parse explicit query JSON if passed.
   */
  if (q) {
    try {
      q = JSON.parse(q);
    } catch (e) {
      throw new Error('Cannot parse query');
    }
  } else {
    q = {};
  }

  /*
    Parse field and operator args.
   */
  Object.keys(p).forEach(key => {
    if (RESERVED_REGEX.test(key)) return;

    let val = p[key];
    if (typeof val === 'string') {
      // Handle encoded spaces and special characters
      val = decodeURIComponent(val);

      // Handle values that look like dates
      const m = moment(val, MOMENT_FORMATS, true);
      if (m.isValid()) val = m.toISOString();
    }

    // Split field name and operator
    const parts = key.split(':');
    const fld = parts[0];
    const op = parts[1];

    if (op) {
      if (!q[fld]) q[fld] = {};
      if (typeof q[fld] !== 'object') q[fld] = { $eq: val };

      q[fld][`$${op}`] = val;
    } else {
      q[fld] = val;
    }
  });

  /*
    Parse limit and sort options.
   */
  const queryOpts = {
    $limit: typeof p.limit === 'number' ? p.limit : 200
  };
  const ascSort = p['sort:asc'] || p.sort;
  const descSort = p['sort:desc'];
  if (typeof ascSort === 'string') queryOpts.$sort = { [ascSort]: 1 };else if (typeof descSort === 'string') queryOpts.$sort = { [descSort]: -1 };

  if (p.file || p.output && p.output !== 'table') tableOpts = {};

  p.query = Object.assign(q, queryOpts, tableOpts, override);
}

exports.queryArgs = queryArgs;

function coerceValue(val) {
  if (typeof val !== 'string') return;

  // Handle encoded spaces and special characters
  val = decodeURIComponent(val);

  /*
    Detect and coerce types
   */

  // Boolean
  if (BOOL_REGEX.test(val)) return val === 'true';

  // Date
  const m = moment(val, MOMENT_FORMATS, true);
  if (m.isValid()) return m.toISOString();

  // Numeric
  const n = parseFloat(val);
  if (!isNaN(n) && isFinite(val)) return n;

  // String
  return val;
}

function value(p) {
  p.value = coerceValue(p.value);
}

exports.value = value;