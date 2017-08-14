import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'intval'
})
export class IntvalPipe implements PipeTransform {
  transform(value: number): number {
    return Math.floor(value);
  }
}
