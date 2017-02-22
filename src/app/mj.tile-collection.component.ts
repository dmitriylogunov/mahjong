import { Component } from '@angular/core';
import { MjTile } from './mj.tile';
import { MJLayoutGraph } from './mj.layout.graph';

@Component({
  selector: 'tiles',
  templateUrl: 'app/mj.tile-collection.component.html',
  styleUrls: ['app/mj.tile-collection.css']
})
export class MjTileCollectionComponent {
  // layout description only, no other data here. Just an array of tile 2d coordinates
  private dragonLayout: [number, number][] = [
    // layer 0
    [2,0],[4,0],[6,0],[8,0],[10,0],[12,0],[14,0],[16,0],[18,0],[20,0],[22,0],[24,0],
                [6,1],[8,1],[10,1],[12,1],[14,1],[16,1],[18,1],[20,1],
    // layer 1
    [8,1],[10,1],[12,1],[14,1],[16,1],[18,1]
  ];

  public collection: [number, number][] = [];

  constructor() {}

  ngOnInit(): void {
    this.loadCollection("dragon");
  }

  tileCollection: Array<{}> = [];

  random(range: number): number {
    return Math.floor(Math.random() * range) + 1;
  }

  loadCollection(layoutType: string): void {
    // layoutType is ignored just yet, always use dragon
    // show "loading"
    console.log("loading started");
    let dragonLayout = new MJLayoutGraph(this.dragonLayout);
    dragonLayout.set({}, this.onLoadComplete);

    // for (let i=0;i<this.dragonLayout.length;i++) {
    //   let newTile = new MjTile(this.dragonLayout[i][0], this.dragonLayout[i][1]);
    //
    //   // determine layer (z coordinate) of the tile
    //   for (let i=0;i<this.tileCollection.length;i++) {
    //     if ((newTile.z<=this.tileCollection[i].z) && newTile.overlaps2d(this.tileCollection[i])) {
    //       newTile.z = this.tileCollection[i].z + 1;
    //     }
    //   }

      // get list of tiles that this new tile blocks or being blocked by
      // this.tileCollection.push(new MjTile(this.random(10), this.random(10)));
    // }

    //test

  }

  onLoadComplete():void {
      // hide "loading"
      console.log("loading finished")
  }
}
