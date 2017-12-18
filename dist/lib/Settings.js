'use strict';

const loadJsonFile = require('load-json-file');
const writeJsonFile = require('write-json-file');

const WRITE_OPTIONS = {
  indent: 2,
  sortKeys: true

  /**
   * Manager to load and save settings in a JSON file.
   */
};class Settings {
  constructor(filePath, options) {
    [this.content, this.filePath, this.options] = [null, filePath, options];
  }

  get safeContent() {
    const content = Object.assign({}, this.content);
    const opts = this.options;

    opts && opts.privateFields && opts.privateFields.forEach(fld => delete content[fld]);

    return content;
  }

  // TODO: Add getByDot and setByDot methods?

  /**
   * Load and optionally create a settings file.
   */
  init(initialContent) {
    return this.load().then(() => {
      return { exists: true };
    }).catch(err => {
      if (err.code !== 'ENOENT') throw err;
      if (!initialContent) return { exists: false };

      this.content = initialContent;

      return this.save().then(() => ({ created: true }));
    });
  }

  load() {
    return loadJsonFile(this.filePath).then(json => this.content = json);
  }

  save() {
    return writeJsonFile(this.filePath, this.content, WRITE_OPTIONS);
  }
}

module.exports = Settings;