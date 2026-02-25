import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  imports: [],
  templateUrl: './spinner.html',
  styleUrl: './spinner.css',
})
export class Spinner {
  @Input() message: string = '';

  private _isLoading = false;

  @Input() set isLoading(value: boolean) {
    this._isLoading = value;
    document.body.style.cursor = value ? 'wait' : 'default';
  }

  get isLoading(): boolean {
    return this._isLoading;
  }
}