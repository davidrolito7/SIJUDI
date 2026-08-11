import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard-oficialia',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard-oficialia.html',
})
export class DashboardOficialia {
  @Input() pendientesRecibir = 0;
}
