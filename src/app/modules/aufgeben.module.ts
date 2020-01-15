import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AufgebenTermineComponent } from '@components/aufgeben-termine/aufgeben-termine.component';
import { AufgebenKazComponent } from '@components/aufgeben-kaz/aufgeben-kaz.component';
import { AufgebenMenuComponent } from '@components/aufgeben-menu/aufgeben-menu.component';
import { AufgebenDisabledComponent } from '@components/ui/aufgeben-disabled/aufgeben-disabled.component';
import { ReplaceWithPricePipe } from '@pipes/replace-with-price.pipe';
import { ReplacePaymentDatePipe } from '@pipes/replace-payment-date.pipe';
import { ReplaceMandatPipe } from '@pipes/replace-mandat.pipe';
import { TextMaskModule } from 'angular2-text-mask'
import { TermineFinalPricePipe } from '@pipes/termine-final-price.pipe';
import { TerminePayCalculationPipe } from '@pipes/termine-pay-calculation.pipe';
import { ReplacePayCalcPipe } from '@pipes/replace-pay-calc.pipe';
import { ReplaceDatePipe } from '@pipes/replace-date.pipe';
import { BasicPipe } from '@pipes/terminePipe.pipe';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SharedModule } from '@modules/shared.module';
import { ReplaceAbsendenPipe } from '@pipes/replace-absenden.pipe';
import { MatMomentDateModule } from '@angular/material-moment-adapter'
import { ScrollingModule } from '@angular/cdk/scrolling';

const routes: Routes = [
    {
      path: '',
      component: AufgebenMenuComponent
    },
    {
      path: 'termine',
      component: AufgebenTermineComponent
    },
    {
      path: 'kazen',
      component: AufgebenKazComponent
    }
]

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    TextMaskModule,
    SharedModule,
    MatProgressSpinnerModule,
    MatMomentDateModule,
    ScrollingModule
  ],
  declarations: [
    AufgebenKazComponent,
    AufgebenTermineComponent,
    AufgebenKazComponent,
    AufgebenDisabledComponent,
    AufgebenMenuComponent,
    ReplaceWithPricePipe,
    ReplacePaymentDatePipe,
    ReplaceMandatPipe,
    TermineFinalPricePipe,
    TerminePayCalculationPipe,
    ReplacePayCalcPipe,
    ReplaceDatePipe,
    BasicPipe,
    ReplaceAbsendenPipe
  ],
  providers: [
  ],
  exports: [
    AufgebenTermineComponent,
    AufgebenMenuComponent
  ]
})
export class AufgebenModule { }
