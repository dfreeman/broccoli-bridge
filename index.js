'use strict';

const Plugin = require('broccoli-plugin');
const symlinkOrCopy = require('symlink-or-copy');
const fs = require('fs-extra');

module.exports = class Bridge {
  constructor() {
    this._placeholders = new Map();
  }

  fulfill(name, tree) {
    // Even if we don't need a placeholder, create one so that the call order of
    // `fulfill`/`placeholderFor` doesn't create an observable difference in behavior.
    this.placeholderFor(name)._fulfill(tree);
  }

  placeholderFor(name) {
    if (this._placeholders.has(name)) {
      return this._placeholders.get(name);
    } else {
      let placeholder = new Placeholder(name);
      this._placeholders.set(name, placeholder);
      return placeholder;
    }
  }
};

class Placeholder extends Plugin {
  constructor(name) {
    super([], {
      name: 'BroccoliBridgePlaceholder',
      annotation: name,
      persistentOutput: true,
    });

    this.placeholderName = name;
    this._hasLinked = false;
  }

  _fulfill(tree) {
    if (this._inputNodes.length) {
      throw new Error(`BroccoliBridge placeholder '${this.placeholderName}' was fulfilled more than once.`);
    }

    this._inputNodes.push(tree);
  }

  build() {
    if (!this._inputNodes.length) {
      throw new Error(`BroccoliBridge placeholder '${this.placeholderName}' was never fulfilled.`);
    }

    if (!this._hasLinked) {
      fs.removeSync(this.outputPath);
      symlinkOrCopy.sync(this.inputPaths[0], this.outputPath);
      this._hasLinked = true;
    }
  }
}
