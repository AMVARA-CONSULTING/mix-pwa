import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from '@modules/shared.module';
import { MediadatenComponent } from '@components/mediadaten/mediadaten.component';

const routes: Routes = [
    {
      path: '',
      component: MediadatenComponent
    }
]

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    SharedModule,
    CommonModule
  ],
  declarations: [
      MediadatenComponent
  ],
  exports: [
      MediadatenComponent
  ]
})
export class MediadatenModule { }
