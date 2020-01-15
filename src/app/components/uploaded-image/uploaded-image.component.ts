import { Component, OnChanges, EventEmitter, Output, SimpleChanges, Input, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

@Component({
  selector: 'mix-uploaded-image',
  templateUrl: './uploaded-image.component.html',
  styleUrls: ['./uploaded-image.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UploadedImageComponent implements OnChanges {

  constructor(
    private _sanitizer: DomSanitizer,
    private _cdr: ChangeDetectorRef,
    private _ref: ElementRef
  ) { }

  Remove(): void {
    this.remove.emit(this.index)
  }

  @ViewChild('image', { static: false }) img: HTMLImageElement

  extension = new BehaviorSubject<string>('')
  loading = new BehaviorSubject<boolean>(true)

  @Output() remove = new EventEmitter<number>()

  @Input() file: File
  @Input() index: number
  @Input() enableRemove: boolean = true

  ngOnChanges(changes: SimpleChanges) {
    if (changes.file && changes.file.currentValue) {
      const file: File = changes.file.currentValue
      const extension = file.type.split('/')[1]
      this._cdr.detectChanges()
      this.extension.next(extension)
      switch (extension) {
        case "png":
        case "jpg":
        case "gif":
        case "jpeg":
          const blobUrl = URL.createObjectURL(file)
          this.loading.next(false)
          setTimeout(_ => this._ref.nativeElement.querySelector('.image').style.backgroundImage = `url(${blobUrl})`)
          break
        default:
          this.loading.next(false)
      }
    }
  }

}
