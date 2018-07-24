# broccoli-bridge [![Build Status](https://travis-ci.org/dfreeman/broccoli-bridge.svg?branch=master)](https://travis-ci.org/dfreeman/broccoli-bridge)

A utility for bridging dependencies between [Broccoli](https://github.com/broccolijs/broccoli) nodes, even if they aren't necessarily available at the time of instantiation.

## Usage

Suppose you have two Broccoli plugins, `A` and `B`, that may be instantiated in any order in different areas of code, but `A` depends on the output of `B`.

```js
const BroccoliBridge = require('broccoli-bridge');

// Stash your bridge instance somewhere central for later access
let bridge = new BroccoliBridge();

// Create your `PluginA` instance using a placeholder...
let a = new PluginA([
  inputOne,
  bridge.placeholderFor('plugin-b')
]);

// ...and then fill in that placeholder with the actual `PluginB` instance at any time before the build starts.
let b = new PluginB([inputTwo, inputThree]);
bridge.fulfill('plugin-b', b);
```

## API

- `bridge.placeholderFor(name)`: returns a placeholder Broccoli node that will ultimately produce the content given by the node it's fulfilled with
- `bridge.fulfill(name, node)`: designates a Broccoli node to provide content for any placeholder(s) with the given name

Note that `placeholderFor(name)` may be called before or after `name` has already been fulfilled without impacting behavior.

## Warning

This package relies on an internal detail of the Broccoli `Plugin` API, and may in principle break at any time.
