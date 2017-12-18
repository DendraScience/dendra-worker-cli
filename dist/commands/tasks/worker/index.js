'use strict';

const path = require('path');

const COMMANDS = [{ prop: 'get-model', req: 'get-model' }, { prop: 'list-models', req: 'list-models' }, { prop: 'create-state', req: 'create-resource', resource: 'state', servicePath: '/state/docs' }, { prop: 'get-state', req: 'get-resource-stringId', resource: 'state', servicePath: '/state/docs' }, { prop: 'list-states', req: 'list-states' }, { prop: 'pull-states', req: 'pull-resources', resource: 'state', servicePath: '/state/docs', title: 'States' }, { prop: 'push-states', req: 'push-resources', resource: 'state', servicePath: '/state/docs', title: 'States' }, { prop: 'remove-state', req: 'remove-resource-stringId', resource: 'state', servicePath: '/state/docs' }, { prop: 'update-state', req: 'update-resource', resource: 'state', servicePath: '/state/docs' }];

module.exports = ctx => {
  const { style } = ctx;
  const tasks = {};

  COMMANDS.forEach(cmd => {
    Object.defineProperty(tasks, cmd.prop, {
      get: () => require(path.join(__dirname, cmd.req))(ctx, cmd)
    });
  });

  return {
    help(p) {
      return style.commandHelp({
        title: 'Worker command help:',
        synopsis: [{ lbl: '<wid>', cmd: '<sub>', opts: '[<options>] [<args>]' }, {}, { lbl: '<wid>', cmd: 'get-*', opts: '--id=<id> [--file=<file> | --save] [--output=color|indent|raw]' }, { lbl: '<wid>', cmd: 'list-*', opts: '[--query=<query>] [--<field>[:<op>]=<value> ...] [--limit=<int>] [--sort[:desc]=<field>] [--file=<file>] [--output=table|color|indent|raw]' }, {}, { lbl: '<wid>', cmd: 'create-*', opts: '[--id=<id>] [--file=<file>] [--save] [--output=color|indent|raw]' }, { lbl: '<wid>', cmd: 'update-*', opts: '[--id=<id>] [--file=<file>] [--save] [--output=color|indent|raw]' }, { lbl: '<wid>', cmd: 'remove-*', opts: '--id=<id> [--deep] [--confirm] [--confirm-deep] [--file=<file> | --save] [--output=indent|raw] [--verbose]' }, {}, { lbl: '<wid>', cmd: 'push-*', opts: '--filespec=<filespec> [--save] [--only=create|update] [--any-suffix] [--dry-run] [--verbose]' }, { lbl: '<wid>', cmd: 'pull-*', opts: '[--query=<query>] [--<field>[:<op>]=<value> ...] [--limit=<int>] [--sort[:desc]=<field>] [--dir=<dir>] [--output=indent|raw] [--dry-run] [--verbose]' }],
        groups: [{
          header: 'Common Options',
          items: [{ opts: '--id=<id>', desc: 'Unique identifier of a resource, can be an ObjectId' }, { opts: '--file=<file>', desc: 'Name of file to load from or save to' }, { opts: '--save', desc: 'Write the response of this command back to a file' }, { opts: '--output=<format>', desc: 'Override the default output format' }, { opts: '--verbose', desc: 'Output additional messages' }]
        }, {
          header: 'Query Options',
          items: [{ opts: '--query=<query>', desc: 'JSON query conditions (URI encoded)' }, { opts: '--<field>[:<op>]=<value>', desc: 'One or more field/operator conditions (URI encoded)' }, { opts: '--limit=<int>', desc: 'Maximum number of records to return (max 2000)' }, { opts: '--sort[:desc]=<field>', desc: 'Sort records by field' }]
        }, {
          header: 'Remove Options',
          items: [{ opts: '--confirm', desc: 'Suppress confirmation prompt (set --confirm=false for "no")' }]
        }, {
          header: 'Push/Pull Options',
          items: [{ opts: '--dir=<dir>', desc: 'Name of directory to save files to' }, { opts: '--filespec=<filespec>', desc: 'Pattern to match one or more files' }, { opts: '--only=<verb>', desc: 'Restrict uploading to create or update' }, { opts: '--any-suffix', desc: 'Process all matching files (don\'t require "*.<resource>.json")' }, { opts: '--dry-run', desc: 'Process files and records without doing anything' }]
        }, {
          header: 'Subcommands',
          items: [{ cmd: 'get-<resource>', desc: 'Fetch a <resource> having <id>' }, { cmd: 'list-<resources>', desc: 'Find <resources> matching <query> or fields' }, { cmd: 'create-<resource>', desc: 'Insert a new <resource> from <file> or "<id>.<resource>.json"' }, { cmd: 'update-<resource>', desc: 'Replace <resource> from <file> or "<id>.<resource>.json"' }, { cmd: 'remove-<resource>', desc: 'Destroy <resource> <id>' }, { cmd: 'push-<resources>', desc: 'Upload <resources> from files matching <filespec> (create or update)' }, { cmd: 'pull-<resources>', desc: 'Download matching <resources> into <dir>' }]
        }, {
          header: 'Resources',
          items: [{ lbl: 'model[s]', desc: 'An tasks\'s transient runtime data (only get and list)' }, { lbl: 'state[s]', desc: 'A document containing initial or persisted settings for a task' }]
        }]
      }, p);
    },

    tasks
  };
};