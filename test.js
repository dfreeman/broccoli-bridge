const { expect, use } = require('chai');
use(require('chai-as-promised'));

const { createBuilder } = require('broccoli-test-helper');
const co = require('co');
const fs = require('fs-extra');
const MergeTrees = require('broccoli-merge-trees');
const Plugin = require('broccoli-plugin');
const Bridge = require('./index');

describe('BroccoliBridge', () => {
  let builder;

  afterEach(co.wrap(function*() {
    if (builder) {
      yield builder.dispose();
    }
  }));

  it('fulfills previously-instantiated placeholders', co.wrap(function*() {
    let bridge = new Bridge();
    let buildCount = 0;

    let pluginA = makePlugin([bridge.placeholderFor('c')], function*() {
      fs.copySync(`${this.inputPaths[0]}/input.txt`, `${this.outputPath}/a.txt`);
    });

    let pluginB = makePlugin([bridge.placeholderFor('c')], function*() {
      fs.copySync(`${this.inputPaths[0]}/input.txt`, `${this.outputPath}/b.txt`);
    });

    let pluginC = makePlugin([], function*() {
      fs.writeFileSync(`${this.outputPath}/input.txt`, `hello #${++buildCount}`);
    });

    bridge.fulfill('c', pluginC);

    builder = createBuilder(new MergeTrees([
      new BlackHole([pluginA, pluginB, pluginC]),
      pluginA,
      pluginB,
    ]));

    yield builder.build();

    expect(builder.read()).to.deep.equal({
      'a.txt': 'hello #1',
      'b.txt': 'hello #1',
    });

    yield builder.build();

    expect(builder.read()).to.deep.equal({
      'a.txt': 'hello #2',
      'b.txt': 'hello #2',
    });
  }));

  it('returns already-fulfilled trees', co.wrap(function*() {
    let bridge = new Bridge();
    let buildCount = 0;

    let pluginC = makePlugin([], function*() {
      fs.writeFileSync(`${this.outputPath}/input.txt`, `hello #${++buildCount}`);
    });

    bridge.fulfill('c', pluginC);

    let pluginA = makePlugin([bridge.placeholderFor('c')], function*() {
      fs.copySync(`${this.inputPaths[0]}/input.txt`, `${this.outputPath}/a.txt`);
    });

    let pluginB = makePlugin([bridge.placeholderFor('c')], function*() {
      fs.copySync(`${this.inputPaths[0]}/input.txt`, `${this.outputPath}/b.txt`);
    });

    builder = createBuilder(new MergeTrees([
      new BlackHole([pluginA, pluginB, pluginC]),
      pluginA,
      pluginB,
    ]));

    yield builder.build();

    expect(builder.read()).to.deep.equal({
      'a.txt': 'hello #1',
      'b.txt': 'hello #1',
    });

    yield builder.build();

    expect(builder.read()).to.deep.equal({
      'a.txt': 'hello #2',
      'b.txt': 'hello #2',
    });
  }));

  it('handles placeholders requested both before and after fulfillment', co.wrap(function*() {
    let bridge = new Bridge();
    let buildCount = 0;

    let pluginA = makePlugin([bridge.placeholderFor('c')], function*() {
      fs.copySync(`${this.inputPaths[0]}/input.txt`, `${this.outputPath}/a.txt`);
    });

    let pluginC = makePlugin([], function*() {
      fs.writeFileSync(`${this.outputPath}/input.txt`, `hello #${++buildCount}`);
    });

    bridge.fulfill('c', pluginC);

    let pluginB = makePlugin([bridge.placeholderFor('c')], function*() {
      fs.copySync(`${this.inputPaths[0]}/input.txt`, `${this.outputPath}/b.txt`);
    });

    builder = createBuilder(new MergeTrees([
      new BlackHole([pluginA, pluginB, pluginC]),
      pluginA,
      pluginB,
    ]));

    yield builder.build();

    expect(builder.read()).to.deep.equal({
      'a.txt': 'hello #1',
      'b.txt': 'hello #1',
    });

    yield builder.build();

    expect(builder.read()).to.deep.equal({
      'a.txt': 'hello #2',
      'b.txt': 'hello #2',
    });
  }));

  it('rejects fulfillment of the same placeholder multiple times', function() {
    let bridge = new Bridge();

    bridge.placeholderFor('a');
    bridge.fulfill('a', {});
    expect(() => bridge.fulfill('a')).to.throw(/fulfilled more than once/);
  });

  it('fails a build when a placeholder is never fulfilled', co.wrap(function*() {
    let bridge = new Bridge();

    builder = createBuilder(bridge.placeholderFor('a'));

    yield expect(builder.build()).to.be.rejectedWith(/never fulfilled/);
  }));
});

class BlackHole extends Plugin {
  build() {
    // Do nothing.
  }
}

function makePlugin(deps, build) {
  return new class extends Plugin {
    constructor() {
      super(deps);
    }

    build() {
      return co.wrap(build).call(this);
    }
  };
}
