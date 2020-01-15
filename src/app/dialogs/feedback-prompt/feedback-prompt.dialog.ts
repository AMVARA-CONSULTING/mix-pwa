import { Component, ChangeDetectionStrategy } from "@angular/core";

@Component({
  selector: 'mix-feedback-prompt',
  templateUrl: 'feedback-prompt.dialog.html',
  styleUrls: ['./feedback-prompt.dialog.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedbackPromptDialog { }