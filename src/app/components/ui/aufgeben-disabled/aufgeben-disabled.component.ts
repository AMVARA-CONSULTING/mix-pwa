import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { SafeStyle } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Component({
  selector: 'mix-aufgeben-disabled',
  templateUrl: './aufgeben-disabled.component.html',
  styleUrls: ['./aufgeben-disabled.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AufgebenDisabledComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    this.notFoundImage.next(`url(assets/shutterstock/Abschalten_Anschalten.jpg)`)
  }

  notFoundImage = new BehaviorSubject<SafeStyle>(null)

}
