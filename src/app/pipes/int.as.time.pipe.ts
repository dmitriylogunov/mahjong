import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'intAsTime'
})
export class IntAsTimePipe implements PipeTransform {
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
