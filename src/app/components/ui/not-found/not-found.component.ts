import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { SafeStyle } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Component({
  selector: 'mix-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotFoundComponent implements OnInit {

  ngOnInit() {
    const n = Math.floor(Math.random() * 2) + 1
    this.notFoundImage.next(`url(assets/shutterstock/stock_not_found${n}.jpg)`)
  }

  notFoundImage = new BehaviorSubject<SafeStyle>(null)

}
