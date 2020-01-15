import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KazKategorieComponent } from '@components/kaz-kategorie/kaz-kategorie.component';
import { SharedModule } from '@modules/shared.module';

@NgModule({
  imports: [
      CommonModule,
      SharedModule
  ],
  declarations: [
      KazKategorieComponent
  ],
  exports: [
      KazKategorieComponent
  ]
})
export class KazenModule { }
