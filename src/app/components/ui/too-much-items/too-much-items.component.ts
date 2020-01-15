import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { SafeStyle } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Component({
  selector: 'mix-too-much-items',
  templateUrl: './too-much-items.component.html',
  styleUrls: ['./too-much-items.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TooMuchItemsComponent implements OnInit {

  ngOnInit() {
    this.notFoundImage.next(`url(assets/shutterstock/1000treffer.jpg)`)
  }

  notFoundImage = new BehaviorSubject<SafeStyle>(null)

  @Input() more: boolean

}
