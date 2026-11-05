/** What a module is to the shell. BOLOs and Logbooks will be modules; for now there is hello. */
export interface StrongholdModule {
  /** The module's id. It is also its folder under src/modules/ and, once there is a router, its route. */
  id: string;
  /**
   * Draws the module into `root` and owns it from then on. Returns the function that takes the module down
   * again; the shell calls it on unmount.
   */
  mount(root: HTMLElement): () => void;
}
