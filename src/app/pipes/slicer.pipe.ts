import { Pipe, PipeTransform } from '@angular/core';
import memo from 'memo-decorator';

@Pipe({
  name: 'slicer'
})
export class SlicerPipe implements PipeTransform {

  @memo((...args: any[]): string => JSON.stringify(args))
  transform(values: any[], start: number, qt: number): any[] {
    // Throws undefined two times in console ... when filtering for Alle+Alle on keydown in keyword
    if (!Array.isArray(values)) return []
    return values.slice(start, qt)
  }

}
