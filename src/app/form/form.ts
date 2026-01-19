import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-form',
  imports: [DatePickerModule, SelectModule, CommonModule, InputTextModule, TextareaModule ],
  templateUrl: './form.html',
  styleUrl: './form.css',
})
export class Form {

}
