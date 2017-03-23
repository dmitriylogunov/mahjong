import { Pipe, PipeTransform } from '@angular/core';

export class AppToolbox {
  // returns random integer in [0..number)
  public static random(range: number): number {
    return Math.floor(Math.random() * range);
  }
}

@Pipe({
  name: 'inttimer'
})
export class OrdinalPipe implements PipeTransform {
  transform(value: number): string {
    let minutes: number  = Math.floor(value/60);
    let seconds: number  = value - minutes*60;
    let secondsStr: string = seconds.toString();
    if (seconds<10) {
      secondsStr = "0"+secondsStr;
    }
    return minutes.toString() + ":" + secondsStr;
  }
}
