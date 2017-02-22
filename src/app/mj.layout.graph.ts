class graph {

}

interface callback {
  (graph[]): void;
}

export class MJLayoutGraph {
  private collection: [number,number][];
  private graph: {}[] = []

  constructor(collection: [number,number][]) {
    this.collection = collection;
  }

  public set(graph: {}, cb: callback) : void {
    cb(this.graph);
  }
}
