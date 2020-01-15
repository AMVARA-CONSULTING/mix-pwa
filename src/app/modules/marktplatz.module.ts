import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from '@modules/shared.module';
import { KazenModule } from '@modules/kazen.module';
import { KazComponent } from '@components/kaz/kaz.component';

const routes: Routes = [
    {
      path: '',
      component: KazComponent
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
      KazComponent
  ],
  exports: [
      KazComponent
  ]
})
export class MarktplatzModule { }
