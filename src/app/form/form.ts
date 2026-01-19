import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-form',
  imports: [DatePickerModule, SelectModule, CommonModule, InputTextModule, TextareaModule, ButtonModule, RouterLink],
  templateUrl: './form.html',
  styleUrl: './form.css',
})
export class Form {

}
