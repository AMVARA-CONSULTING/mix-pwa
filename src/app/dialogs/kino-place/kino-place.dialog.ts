import { Component, ChangeDetectionStrategy, Inject } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { KinoRelatedDate } from "@other/interfaces";

@Component({
  selector: 'mix-kino-place',
  templateUrl: 'kino-place.dialog.html',
  styleUrls: ['./kino-place.dialog.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KinoPlaceDialog {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: KinoRelatedDate
  ) { }

  goWebsite() {
    if (this.data.hasOwnProperty('homepage_prefixed') && !this.data['homepage_prefixed']) this.data['homepage_prefixed'] = 'http://' + this.data['homepage_prefixed']
    if ((!this.data.homepage.startsWith('https://')) && !this.data.homepage.startsWith('http://')) this.data.homepage = 'http://' + this.data.homepage;
    window.open(this.data['homepage_prefixed'] || this.data.homepage)
  }

  //open url google maps with the correct sanitized string
  openMaps() {
    let maps_api = 'www.google.com/maps/search/?api=1&query='
    const verort = this.data.adressname.toLowerCase()
    var url = verort.replace("treffpunkt: ", "")
    if (this.data.strasse != null) var strasse = "+" + this.data.strasse.toLowerCase()
    else strasse = ""
    if (this.data.plzort != null) var plzort = "+" + this.data.plzort.toLowerCase()
    else plzort = ""
    url = url + strasse + plzort
    url = url.replace(" ", "+")
    var href = `https://${maps_api}${encodeURIComponent(url)}`;
    window.open(href);
  }

}