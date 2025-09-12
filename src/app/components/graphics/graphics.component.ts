import { Component } from '@angular/core';
import { ChartModule } from 'primeng/chart';
@Component({
  selector: 'app-graphics',
  imports: [ChartModule],
  templateUrl: './graphics.component.html',
  styleUrl: './graphics.component.scss'
})
export class GraphicsComponent {
  basicData: any;
  basicOptions: any;

  constructor() {
    this.basicData = {
      labels: ['Nodo 1', 'Nodo 2', 'Nodo 3', 'Nodo 4', 'Nodo 5'],
      datasets: [
        {
          label: 'Lecturas',
          backgroundColor: '#42A5F5',
          borderColor: '#1E88E5',
          data: [12, 19, 7, 25, 14] // 👈 valores de ejemplo
        }
      ]
    };

    this.basicOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: '#495057'
          }
        }
      },
      scales: {
        x: {
          ticks: { color: '#495057' },
          grid: { color: '#ebedef' }
        },
        y: {
          ticks: { color: '#495057' },
          grid: { color: '#ebedef' }
        }
      }
    };
  }
}
