#!/usr/bin/env node
'use strict';

/**
 * Dendra CLI entry point.
 *
 * @author J. Scott Smith
 * @license BSD-2-Clause-FreeBSD
 * @module den
 */

const mri = require('mri');
const print = require('./lib/print');

const log = console;

process.on('uncaughtException', err => {
  log.error(`An unexpected error occurred\n  ${err.stack}`);
  process.exit(1);
});

process.on('unhandledRejection', err => {
  if (!err) {
    log.error('An unexpected empty rejection occurred');
  } else if (err instanceof Error) {
    log.error(`An unexpected rejection occurred\n  ${err.stack}`);
  } else {
    log.error(`An unexpected rejection occurred\n  ${err}`);
  }
  process.exit(1);
});

require('./app')(log).then(app => {
  const args = process.argv.slice(2);
  const parsed = mri(args, {
    alias: {
      any_suffix: 'any-suffix',
      confirm_deep: 'confirm-deep',
      dry_run: 'dry-run'
    },
    default: app.get('mergedSettings').content.default,
    boolean: ['any_suffix', 'confirm', 'confirm_deep', 'deep', 'dry_run', 'verbose'],
    string: ['dir', 'file', 'filespec', 'id', 'output', 'value', 'wid']
  });

  return app.command.eval(parsed);
}).then(state => {
  print(state.output, state.parsed);
}).catch(err => {
  print(err);
});