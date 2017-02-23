import { Component } from '@angular/core';
import { MjTile } from './mj.tile';
import { MJLayoutGraph } from './mj.layout.graph';

@Component({
  selector: 'tiles',
  templateUrl: 'app/mj.tile-collection.component.html',
  styleUrls: ['app/mj.tile-collection.css']
})
export class MjTileCollectionComponent {
  constructor() {
  }

  // layout description only, no other data here. Just an array of tile 2d coordinates
  private dragonLayout: [number, number][] = [
    // layer 0
    [2,0],[4,0],[6,0],[8,0],[10,0],[12,0],[14,0],[16,0],[18,0],[20,0],[22,0],[24,0],
                [6,1],[8,1],[10,1],[12,1],[14,1],[16,1],[18,1],[20,1],
    // layer 1
    [8,1],[10,1],[12,1],[14,1],[16,1],[18,1]
  ];

  public currentLayout: MJLayoutGraph;

  ngOnInit(): void {
    this.loadCollection("dragon");
  }

  // random(range: number): number {
  //   return Math.floor(Math.random() * range) + 1;
  // }

  loadCollection(layoutType: string): void {
    // layoutType is ignored just yet, always use dragon

    let dragonLayout = new MJLayoutGraph(this.dragonLayout);

    console.log("loading started");     // TODO show "loading"
    dragonLayout.set({}, this.onLoadComplete.bind(this));

    // for (let i=0;i<this.dragonLayout.length;i++) {
    //   let newTile = new MjTile(this.dragonLayout[i][0], this.dragonLayout[i][1]);
    //


      // get list of tiles that this new tile blocks or being blocked by
      // this.tileCollection.push(new MjTile(this.random(10), this.random(10)));
    // }

    //test

  }

  // runs out of the class context, so use self instead of this
  onLoadComplete(layout: MJLayoutGraph):void {
    this.currentLayout = layout;
    console.log("loading finished");     // TODO hide "loading"
  }
}
