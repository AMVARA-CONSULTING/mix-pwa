import { Component, Input, Output, EventEmitter, OnChanges, ChangeDetectionStrategy, SimpleChanges } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Component({
  selector: 'mix-uploaded-text',
  templateUrl: './uploaded-text.component.html',
  styleUrls: ['./uploaded-text.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UploadedTextComponent implements OnChanges {

  constructor() { }

  Remove(): void {
    this.remove.emit(this.index)
  }

  extension: BehaviorSubject<string> = new BehaviorSubject<string>('')

  @Output() remove = new EventEmitter<number>()

  @Input() file: File
  @Input() index: number
  @Input() enableRemove: boolean = true

  ngOnChanges(changes: SimpleChanges) {
    const file: File = changes.file.currentValue
    this.extension.next(file.type.split('/')[1])
  }

}
