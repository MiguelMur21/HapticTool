import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthServiceService } from '../services/auth-service.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthServiceService);
  const router = inject(Router);

  const user = authService['currentUser$'].getValue();

  // ❌ Si no hay sesión iniciada
  if (!authService.isAuthenticated() || !user) {
    console.warn('⛔ Acceso denegado: usuario no autenticado.');
    router.navigate(['/Inicio-sesión']);
    return false;
  }

  // 🔒 Si hay restricción de roles
  const allowedRoles = route.data?.['roles'] as string[] | undefined;
  if (allowedRoles && user.rol?.nombre) {
    const userRole = user.rol.nombre.toLowerCase();
    const hasAccess = allowedRoles.some(r => r.toLowerCase() === userRole);

    if (!hasAccess) {
      console.warn(`🚫 Acceso denegado: rol "${userRole}" no permitido.`);
      router.navigate(['/']);
      return false;
    }
  }

  return true;
};
