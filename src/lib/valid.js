/**
 * CLI validation functions.
 *
 * @author J. Scott Smith
 * @license BSD-2-Clause-FreeBSD
 * @module lib/valid
 */

const check = require('check-types')

function objectId (p, field = 'id') {
  // TODO: Add regex test
  check.assert.nonEmptyString(p[field], `Required: ${field}`)
}

exports.objectId = objectId

function string (p, field) {
  check.assert.nonEmptyString(p[field], `Required: ${field}`)
}

exports.string = string
