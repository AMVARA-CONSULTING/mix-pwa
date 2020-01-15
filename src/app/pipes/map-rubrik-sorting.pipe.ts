import { Pipe, PipeTransform, Host, Optional } from '@angular/core';
import { InfoService } from '@services/info.service';
import { TermineComponent } from '@components/termine/termine.component';

@Pipe({
  name: 'mapRubrikSorting'
})
export class MapRubrikSortingPipe implements PipeTransform {

  constructor(
    private _info: InfoService,
    @Host() @Optional() private _termine: TermineComponent
  ) { }

  transform(rubriks: RubrikType[], filter: string, mobile: boolean): RubrikType[] {
    // Prevent this pipe to modify the source rubriks
    rubriks = rubriks.slice()

    // Implement here other 'if' cases if you need to specify another kind of sort for other views or devices
    // ...

    // Only return sorted rubriks on Rubrik View and Desktop
    if (filter === 'rubrik' && !mobile) {
      // Get reference from mix20_generic_rest_api rubriks
      let rubriksRef = this._info.serverInfo.rubriks
      // Sort them
      rubriksRef.sort((a, b) => a.rubrik_order - b.rubrik_order)
      // @ts-ignore
      rubriksRef = rubriksRef.map(r => r.rubrik)
      // Backup of the banners position before remapping 
      const bannersBackup = []
      for (let i = 0; i < rubriks.length; i++) {
        if (rubriks[i].rubrik === 'banner') {
          bannersBackup.push({ position: i, value: rubriks[i] })
          rubriks.splice(i, 1)
        }
      }
      // Remapping
      rubriks = this.mapOrder(rubriks, rubriksRef, 'rubrik')
      // Reinsert banners to previous state
      for (let i = 0; i < bannersBackup.length; i++) {
        rubriks.splice(bannersBackup[i].position, 0, bannersBackup[i].value)
      }
      // Insert banners if doesn't exist (Only in Desktop and Rubrik View)
      if (bannersBackup.length === 0 && this._termine) {
        if (!this._termine.mobile.getValue() && this._termine.filter.getValue() === 'rubrik') {
          for (let i = 0; i < rubriks.length;) {
            if (!!i) {
              // @ts-ignore
              rubriks.splice(i, 0, { rubrik: 'banner' })
              i += 4
            } else {
              i += 3
            }
          }
        }
      }
      return rubriks
    } else {
      if (filter === 'titel' || filter === 'adressname') {
        rubriks.sort((a, b) => {
          if(a.rubrik < b.rubrik) return -1
          if(a.rubrik > b.rubrik) return 1
          return 0
        })
      }
      return rubriks
    }
  }

  // Sort array by property from another array order reference
  // https://gist.github.com/ecarter/1423674
  mapOrder (array, order, key) {
    array.sort( function (a, b) {
      var A = a[key], B = b[key]
      if (order.indexOf(A) > order.indexOf(B)) {
        return 1
      } else {
        return -1
      }
    })
    return array
  }

}

interface RubrikType {
  rubrik: string
  datum: string
  uhrzeit: string
  datum_humanized: string
}