import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabMenuModule } from 'primeng/tabmenu';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { AuthServiceService } from '../../services/auth-service.service';
import { User } from '../../models/user';

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

  constructor(private router: Router, private authService: AuthServiceService) {}

  ngOnInit(): void {
    this.authService.getCurrentUser$().subscribe(user => {
      this.user = user;
    });
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
}
