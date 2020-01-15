import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { KontakteComponent } from '@components/kontakte/kontakte.component';
import { SharedModule } from '@modules/shared.module';
import { KazenModule } from '@modules/kazen.module';

const routes: Routes = [
    {
      path: '',
      component: KontakteComponent
    }
]

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    KazenModule,
    SharedModule,
    CommonModule
  ],
  declarations: [
      KontakteComponent
  ],
  exports: [
      KontakteComponent
  ]
})
export class KontakteModule { }
