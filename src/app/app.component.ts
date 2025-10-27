import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Haptictool';

  constructor(private router: Router) {}

  ngOnInit() {
    // Escuchar cambios de ruta para actualizar la visibilidad del header
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe((event: any) => {
        // Forzar la actualización de la vista
        setTimeout(() => {
          // Esto activará el cambio de detección
        }, 0);
      });
  }

  // Método para determinar si mostrar header (footer siempre visible)
 shouldShowHeader(): boolean {
    const currentUrl = decodeURIComponent(this.router.url);
    
    // Rutas donde NO debe mostrarse el header
    const hiddenRoutes = [
      '/Inicio-sesión',
      '/login', 
      '/Registro',
      '/register'
    ];

    return !hiddenRoutes.some(route => 
      currentUrl.startsWith(route) || currentUrl === route
    );
  }
}