import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { Router } from '@angular/router';
import { AuthServiceService } from '../../services/auth-service.service';
import { User } from '../../models/user';
import { RouterModule } from '@angular/router'; // 👈 IMPORTANTE

@Component({
  selector: 'app-superadmin',
    standalone: true,
  imports: [CommonModule, ButtonModule, CardModule,
        RouterModule, // 👈 NECESARIO para <router-outlet>
  ],
  templateUrl: './superadmin.component.html',
  styleUrl: './superadmin.component.scss'
})
export class SuperadminComponent {
user: User | null = null;

  constructor(private authService: AuthServiceService, private router: Router) {}

  ngOnInit(): void {
    this.authService.getCurrentUser$().subscribe(user => {
      this.user = user;
    });
  }

  goToUsers() {
    this.router.navigate(['/admin-usuarios']);
  }

  goToFiles() {
    this.router.navigate(['/admin-archivos']);
  }
}
