import BroccoliPlugin, { BroccoliNode } from 'broccoli-plugin';

/**
 * A utility for bridging dependencies between Broccoli nodes, even if they
 * aren't necessarily available at the time of instantiation.
 */
declare class BroccoliBridge {
  /**
   * Returns a placeholder Broccoli node that will ultimately produce the
   * content given by the node it's fulfilled with.
   *
   * Note that `placeholderFor(name)` may be called before or after `name` has
   * already been fulfilled without impacting behavior.
   */
  placeholderFor(name: string): BroccoliBridgePlaceholder;

  /**
   * Designates a Broccoli node to provide content for any placeholder(s) with
   * the given name.
   */
  fulfill(name: string, tree: BroccoliNode): void;
}

declare class BroccoliBridgePlaceholder extends BroccoliPlugin {
  public readonly placeholderName: string;

  constructor(placeholderName: string);

  private _fulfill(tree: BroccoliNode): void;
}

export = BroccoliBridge;
