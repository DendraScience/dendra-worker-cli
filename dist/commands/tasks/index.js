'use strict';

const path = require('path');
const feathers = require('@feathersjs/feathers');
const restClient = require('@feathersjs/rest-client');
const request = require('request');

const COMMANDS = ['cli', 'init'];

module.exports = ctx => {
  const { app, style } = ctx;

  return {
    help(p) {
      return style.commandHelp({
        title: 'Command line tool for managing worker instances.',
        synopsis: [{ cmd: '<command>', opts: '[<options>] [<args>]' }, { cmd: '<command>', sub: '<sub>', opts: '[<options>] [<args>]' }],
        groups: [{
          header: 'Commands',
          items: [{ cmd: 'help', desc: 'Show help on commands' }, {}, { cmd: 'init', desc: 'Create a project settings file (den-worker.json) in the current directory' }]
        }, {
          header: 'Subcommands',
          items: [{ cmd: 'cli', sub: 'help', desc: 'Show help on CLI subcommands' }, { cmd: 'cli', sub: '<sub>', desc: 'Run a CLI subcommand' }, {}, { cmd: '<wid>', sub: 'help', desc: 'Show help on worker subcommands' }, { cmd: '<wid>', sub: '<sub>', desc: 'Run a worker subcommand' }]
        }]
      }, p);
    },

    tasks(p, arg) {
      if (COMMANDS.includes(arg)) return require(path.join(__dirname, arg))(ctx);

      // Configure connection using worker id arg
      if (!ctx.conns) ctx.conns = {};
      const conn = ctx.conns.web = {
        url: app.get('workerUrl').replace('$0', arg)
      };
      conn.app = feathers().configure(restClient(conn.url).request(request));

      return require('./worker')(ctx);
    }
  };
};