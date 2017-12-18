/**
 * CLI output styling.
 *
 * @author J. Scott Smith
 * @license BSD-2-Clause-FreeBSD
 * @module lib/style
 */

const chalk = require('chalk')
const stringLength = require('string-length')
const {getBorderCharacters, table} = require('table')
const {getByDot} = require('./utils')

const EMPTY = ''

exports.EMPTY = EMPTY

function placeholder (obj) {
  return (typeof obj === 'undefined') || (obj === null) ? '..' : obj
}

function processGroup (group, maxWidth, p, output, cb) {
  if (!(group.items && group.items.length)) return

  const visItems = group.items.filter(item => !item.vis || p.all)
  const numItems = visItems.length

  if (!numItems) return

  if (group.header) {
    output.push(chalk.underline(group.header))
    output.push(EMPTY)
  }

  let col0Width = 0

  const tableData = visItems.map(item => {
    const parts = []
    if (item.lbl) parts.push(item.lbl)
    if (item.cmd) parts.push(chalk.bold(item.cmd))
    if (item.sub) parts.push(chalk.dim(item.sub))
    if (item.opts) parts.push(item.opts)

    const cols = cb(item, parts)

    col0Width = Math.max(stringLength(cols[0]), col0Width)
    return cols
  })

  col0Width = Math.min(col0Width, Math.floor(maxWidth * 0.6))

  const tableConfig = {
    border: getBorderCharacters('void'),
    columnDefault: {
      paddingRight: 0
    },
    drawHorizontalLine () {
      return false
    },
    columns: {
      0: {
        paddingLeft: 2,
        width: col0Width
      },
      1: {
        paddingLeft: 1,
        width: maxWidth - col0Width
      }
    }
  }

  output.push(table(tableData, tableConfig))

  return numItems
}

function commandHelp (config, p) {
  const output = [
    EMPTY,
    ' _| _ _  _| _ _ ',
    '(_|(-| )(_|| (_| Worker CLI 1.0',
    EMPTY
  ]
  const ttyWidth = process.stdout.columns
  const maxWidth = ttyWidth - 3
  let showingCommon

  if (config.title) {
    output.push(config.title)
    output.push(EMPTY)
  }

  if (config.synopsis && config.synopsis.length) {
    const group = {
      header: 'Usage',
      items: config.synopsis
    }
    const numItems = processGroup(group, maxWidth, p, output, (item, parts) => {
      return [
        parts.length ? '$ den-worker' : ' ',
        parts.length ? parts.join(' ') : ' '
      ]
    })

    if (group.items.length > numItems) showingCommon = true
  }

  if (config.groups && config.groups.length) {
    config.groups.forEach(group => {
      const numItems = processGroup(group, maxWidth, p, output, (item, parts) => {
        return [
          parts.length ? parts.join(' ') : ' ',
          item.desc
        ]
      })

      if (group.items.length > numItems) showingCommon = true
    })
  }

  if (p.all) {
    output.push('Showing all commands. To see only commonly used commands, remove the `--all` option.')
    output.push(EMPTY)
  } else if (showingCommon) {
    output.push('Showing only commonly used commands. To see all commands, add the `--all` option.')
    output.push(EMPTY)
  }

  return output
}

exports.commandHelp = commandHelp

function dataTable (res, cols, p) {
  if ((typeof res !== 'object') || Array.isArray(res)) return res
  if (!Array.isArray(res.data)) return res
  if (p.output && (p.output !== 'table')) return res

  const output = []
  const ttyWidth = process.stdout.columns
  let totalWidth = cols.reduce((total, col) => total + col.size + 1, 0)

  if (p.verbose && p.query) {
    output.push({query: p.query})
    output.push(EMPTY)
  }

  // Remove intermediate columns that don't fit
  while ((cols.length > 1) && (totalWidth > ttyWidth)) {
    const first = cols.shift()
    totalWidth -= cols.shift().size + 1
    cols.unshift(first)
  }

  // Map row object properties to column array
  const tableData = res.data.map(rowObj => {
    return cols.map(col => placeholder(getByDot(rowObj, col.name)))
  })

  // Prepend header row
  tableData.unshift(cols.map(col => chalk.bold(col.alias || col.name)))

  // Distribute any remaining space over all fill columns
  const fillCols = cols.filter(col => col.mode === 'fill')
  const remSpace = ttyWidth - totalWidth
  if (fillCols.length && (remSpace > 0)) {
    const addSize = Math.floor(remSpace / fillCols.length)
    fillCols.forEach(col => (col.size += addSize))
  }

  const tableConfig = {
    border: getBorderCharacters('void'),
    columnDefault: {
      paddingLeft: 0,
      paddingRight: 1
    },
    drawHorizontalLine () {
      return false
    },
    columns: cols.map(col => {
      if (col.size > 1) return Object.assign({width: col.size}, col.opts)
      return col.opts
    })
  }

  output.push(table(tableData, tableConfig))
  output.push([{text: 'Items', tail: ':'}, res.data.length])

  return output
}

exports.dataTable = dataTable
