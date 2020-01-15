import { Component, ChangeDetectionStrategy } from '@angular/core';
import { GlobalsService } from '@services/globals.service';

@Component({
  selector: 'mix-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditorComponent {

  constructor(
    public globals: GlobalsService
  ) { }

}
