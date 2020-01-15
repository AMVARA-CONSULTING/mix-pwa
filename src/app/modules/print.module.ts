import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from '@modules/shared.module';
import { PrintComponent } from '@components/print/print.component';
import { PrintDatePipe } from '@pipes/print-date.pipe';
import { PrintsDialog } from 'app/dialogs/prints/prints.dialog';
import { PrintBackgroundPipe } from '@pipes/print-background.pipe';

const routes: Routes = [
    {
      path: '',
      component: PrintComponent
    }
]

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    SharedModule,
    CommonModule
  ],
  declarations: [
      PrintComponent,
      PrintDatePipe,
      PrintsDialog,
      PrintBackgroundPipe
  ],
  entryComponents: [
    PrintsDialog
  ],
  exports: [
      PrintComponent,
      PrintDatePipe,
      PrintsDialog,
      PrintBackgroundPipe
  ]
})
export class PrintModule { }
