import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from '@modules/shared.module';
import { DatenschutzComponent } from '@components/datenschutz/datenschutz.component';

const routes: Routes = [
    {
      path: '',
      component: DatenschutzComponent
    }
]

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    SharedModule,
    CommonModule
  ],
  declarations: [
    DatenschutzComponent
  ],
  exports: [
    DatenschutzComponent
  ]
})
export class DatenschutzModule { }
