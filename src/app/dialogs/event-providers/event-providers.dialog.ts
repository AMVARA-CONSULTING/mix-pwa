import { Component, ChangeDetectionStrategy, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { EventProvider, ProviderTicket } from "@other/interfaces";
import { ApiService } from "@services/api.service";
import { SafeUrl, DomSanitizer } from "@angular/platform-browser";

@Component({
  selector: 'mix-event-providers',
  templateUrl: 'event-providers.dialog.html',
  styleUrls: ['./event-providers.dialog.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventProvidersDialog {

  constructor(
    public dialogRef: MatDialogRef<EventProvidersDialog>,
    private _api: ApiService,
    private _sanitizer: DomSanitizer,
    @Inject(MAT_DIALOG_DATA) public data: {
      providers: EventProvider[],
      eventid: string,
      eventhash: string,
      urls?: ProviderTicket[]
    }
  ) { }

  getLink(provider: EventProvider): SafeUrl {
    const url = this._api.generateTicketLink(provider.provider, provider.id, this.data.eventhash)
    return this._sanitizer.bypassSecurityTrustUrl(url)
  }

}