const path = require('path')

const COMMANDS = [
  'get-project-settings',
  'get-user-settings',
  'init-project',
  'set-project-environment',
  'set-project-field',
  'set-user-environment',
  'set-user-field'
]

module.exports = (ctx) => {
  const {style} = ctx
  const tasks = {}

  COMMANDS.forEach(cmd => {
    Object.defineProperty(tasks, cmd, {
      get: () => require(path.join(__dirname, cmd))(ctx)
    })
  })

  return {
    help (p) {
      return style.commandHelp({
        title: 'CLI command help:',
        synopsis: [
          {lbl: 'cli', cmd: '<sub>', opts: '[<options>] [<args>]'},
          {},
          {lbl: 'cli', cmd: 'get-*', opts: '[--file=<file> | --save] [--output=color|indent|raw]'},
          {lbl: 'cli', cmd: 'set-*-environment', opts: '--value=<value>'},
          {lbl: 'cli', cmd: 'set-*-field', opts: '--key=<key> --value=<value>'}
        ],
        groups: [{
          header: 'Options',
          items: [
            {opts: '--file=<file>', desc: 'Name of file to load from or save to'},
            {opts: '--save', desc: 'Write the response of this command back to a file'},
            {opts: '--output=<format>', desc: 'Override the default output format'},
            {opts: '--key=<key>', desc: 'Key path to a settings field (e.g. "foo.bar")'},
            {opts: '--value=<value>', desc: 'Value for a settings field'}
          ]
        }, {
          header: 'Subcommands',
          items: [
            {cmd: 'init', desc: 'Create a project settings file (den-worker.json) in the current directory'},
            {},
            {cmd: 'get-project-settings', desc: 'Fetch current project settings'},
            {cmd: 'set-project-environment', desc: 'Set project environment to <value>'},
            {cmd: 'set-project-field', desc: 'Assign project setting <key> to <value>'},
            {},
            {cmd: 'get-user-settings', desc: 'Fetch current user settings'},
            {cmd: 'set-user-environment', desc: 'Set user environment to <value>'},
            {cmd: 'set-user-field', desc: 'Assign user setting <key> to <value>'}
          ]
        }]
      }, p)
    },

    tasks
  }
}
