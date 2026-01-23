import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Table, TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { ProgressBar } from 'primeng/progressbar';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { StyleClass } from "primeng/styleclass";
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    HttpClientModule,
    InputTextModule,
    TagModule,
    SelectModule,
    MultiSelectModule,
    ProgressBar,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    RouterLink
],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  customers = [
    {
      id: 1,
      name: 'Alice Smith',
      country: { name: 'USA', code: 'us' },
      representative: { name: 'Amy Elsner', image: 'amyelsner.png' },
      date: new Date('2024-01-12'),
      balance: 12345.67,
      status: 'new',
      activity: 42,
      verified: true,
    },
    {
      id: 2,
      name: 'Juan Pérez',
      country: { name: 'Mexico', code: 'mx' },
      representative: { name: 'Bernardo Dominic', image: 'bernardodominic.png' },
      date: new Date('2024-02-03'),
      balance: 9876.54,
      status: 'qualified',
      activity: 78,
      verified: false,
    },
  ];

  representatives = [
    { name: 'Amy Elsner', image: 'amyelsner.png' },
    { name: 'Bernardo Dominic', image: 'bernardodominic.png' },
  ];

  statuses = [
    { label: 'Unqualified', value: 'unqualified' },
    { label: 'Qualified', value: 'qualified' },
    { label: 'New', value: 'new' },
    { label: 'Negotiation', value: 'negotiation' },
    { label: 'Renewal', value: 'renewal' },
    { label: 'Proposal', value: 'proposal' },
  ];

  loading = false;
  searchValue: string | undefined;

  clear(table: Table) {
    table.clear();
    this.searchValue = '';
  }

  getSeverity(status: string) {
    switch (status.toLowerCase()) {
      case 'unqualified':
        return 'danger';
      case 'qualified':
        return 'success';
      case 'new':
        return 'info';
      case 'negotiation':
        return 'warn';
      case 'renewal':
        return null;
      default:
        return null;
    }
  }
}
