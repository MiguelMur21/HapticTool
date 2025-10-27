import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabMenuModule } from 'primeng/tabmenu';
import { ButtonModule } from 'primeng/button';
import { Router, NavigationEnd } from '@angular/router';
import { AuthServiceService } from '../../services/auth-service.service';
import { User } from '../../models/user';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    TabMenuModule,
    ButtonModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  user: User | null = null;
  showHeader: boolean = true;

  constructor(private router: Router, private authService: AuthServiceService) {}

  ngOnInit(): void {
    this.authService.getCurrentUser$().subscribe(user => {
      this.user = user;
    });

    // Escuchar cambios de ruta
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe((event: any) => {
        this.checkHeaderVisibility(event.url);
      });

    // Verificar visibilidad al iniciar
    this.checkHeaderVisibility(this.router.url);
  }

  // Método para verificar si debe mostrarse el header
  private checkHeaderVisibility(url: string): void {
    // Rutas donde NO debe mostrarse el header
    const hiddenRoutes = [
      '/Inicio-sesión',
      '/Registro', 
    ];

    this.showHeader = !hiddenRoutes.some(route => 
      url.startsWith(route) || url === route
    );
  }

  goTo(path: string) {
    this.router.navigate([path]);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/Inicio-sesión']);
  }

  // 🔹 Saber si el usuario es superadministrador
  isSuperAdmin(): boolean {
    return this.user?.rol?.rol_id === 3 || 
           this.user?.rol?.nombre?.toLowerCase() === 'super administrador';
  }

  // 🔹 Saber si está en la vista del administrador
  isAdminView(): boolean {
    return this.router.url.startsWith('/administrador');
  }

  isActive(route: string): boolean {
    return this.router.url === route;
  }

  // Saber si el usuario es "normal" (rol 1)
  isUserNormal(): boolean {
    return this.user?.rol?.rol_id === 1 || 
           this.user?.rol?.nombre?.toLowerCase() === 'usuario';
  }

  // Saber si el usuario es "investigador" (rol 2)
  isResearcher(): boolean {
    return this.user?.rol?.rol_id === 2 || 
           this.user?.rol?.nombre?.toLowerCase() === 'investigador';
  }
}