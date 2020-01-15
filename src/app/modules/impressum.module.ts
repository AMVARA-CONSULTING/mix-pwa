import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from '@modules/shared.module';
import { ImpressumComponent } from '@components/impressum/impressum.component';
import { KontaktformularComponent } from '@components/kontaktformular/kontaktformular.component';

const routes: Routes = [
    {
      path: '',
      component: ImpressumComponent
    }
]

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    SharedModule,
    CommonModule
  ],
  declarations: [
      ImpressumComponent,
      KontaktformularComponent
  ],
  exports: [
      ImpressumComponent,
      KontaktformularComponent
  ]
})
export class ImpressumModule { }
