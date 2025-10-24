import { Component } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [DialogModule, ButtonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  visibleAviso = false;

  mostrarAviso() {
    console.log('Abriendo diálogo...');
    this.visibleAviso = true;
  }
}
