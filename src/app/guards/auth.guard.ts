import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthServiceService } from '../services/auth-service.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthServiceService);
  const router = inject(Router);

  // Verifica si el usuario está autenticado
  if (authService.isAuthenticated()) {
    return true; // ✅ Permite el acceso a la ruta
  } else {
    console.warn('⛔ Acceso denegado. No hay token válido.');
    router.navigate(['/login']); // 🔄 Redirige al login si no hay sesión
    return false;
  }
};