import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, switchMap, tap } from 'rxjs';
import { ApiService, TOKEN_KEY, USER_KEY } from './api.service';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {
  private currentUser$ = new BehaviorSubject<User | null>(null);
  
  // ✅ CORREGIDO: Client ID sin http:// y sin /
  private googleClientId = '606065282337-hsc5g7rcl983d4d3qhaf6upmhaaa90d2.apps.googleusercontent.com';

  public readonly ROLES = {
    USUARIO_NORMAL: 1,
    ADMIN: 2,  
    SUPER_ADMIN: 3
  };

  public readonly ROLE_NAMES: { [key: number]: string } = {
    1: 'usuario_normal',
    2: 'admin', 
    3: 'super_admin'
  };

  constructor(
    private api: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const raw = localStorage.getItem(USER_KEY);
      if (raw) {
        this.currentUser$.next(JSON.parse(raw));
      }
      this.loadGoogleScript();
    }
  }

  // ==================== GOOGLE OAUTH ====================

  private loadGoogleScript(): void {
    if (document.querySelector('script[src*="accounts.google.com"]')) {
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log('✅ Google Identity Services cargado');
      this.initializeGoogleAuth();
    };
    script.onerror = () => {
      console.error('❌ Error cargando Google Identity Services');
    };
    document.head.appendChild(script);
  }

  private initializeGoogleAuth(): void {
    if (typeof (window as any).google === 'undefined') {
      console.error('Google no está disponible');
      return;
    }

    (window as any).google.accounts.id.initialize({
      client_id: this.googleClientId,
      callback: (response: any) => this.handleGoogleResponse(response),
      auto_select: false,
      cancel_on_tap_outside: true
    });

    console.log('✅ Google Auth inicializado correctamente');
  }

  private handleGoogleResponse(response: any): void {
    console.log('🔐 Respuesta de Google recibida:', response);
    
    if (!response.credential) {
      console.error('No se recibió credential de Google');
      return;
    }

    this.authenticateWithGoogle(response.credential);
  }

  // ✅ CORREGIDO: Enviar como JSON, no FormData
  private authenticateWithGoogle(credential: string): void {
    const payload = {
      credential: credential
    };

    this.api['http'].post(`${this.api['apiUrl']}/auth/google`, payload)
      .subscribe({
        next: (authResponse: any) => {
          console.log('✅ Login con Google exitoso:', authResponse);
          this.handleGoogleAuthSuccess(authResponse);
        },
        error: (error) => {
          console.error('❌ Error en login con Google:', error);
          this.handleAuthError(error); // ✅ AHORA ESTE MÉTODO EXISTE
        }
      });
  }

  private handleGoogleAuthSuccess(authResponse: any): void {
    if (authResponse.access_token && isPlatformBrowser(this.platformId)) {
      localStorage.setItem(TOKEN_KEY, authResponse.access_token);
      
      if (authResponse.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(authResponse.user));
        this.currentUser$.next(authResponse.user);
      }
      
      // Redirigir al dashboard
      window.location.href = '/dashboard';
    }
  }

  // ==================== MANEJO DE ERRORES ====================

  private handleAuthError(error: any): void {
    console.error('❌ Error completo de autenticación:', error);
    
    let errorMessage = 'Error de autenticación';
    
    if (error.status === 400) {
      errorMessage = 'Token de Google inválido o expirado';
    } else if (error.status === 401) {
      errorMessage = 'No autorizado';
    } else if (error.status >= 500) {
      errorMessage = 'Error del servidor. Intenta más tarde.';
    } else if (error.status === 0) {
      errorMessage = 'No se puede conectar al servidor. Verifica tu conexión.';
    }
  
    console.error('❌ Error de autenticación:', errorMessage);
    
    // Opcional: Puedes emitir un Subject de errores si quieres mostrar en UI
    // this.errorSubject.next(errorMessage);
  }

  // ==================== MÉTODOS PÚBLICOS GOOGLE ====================

  renderGoogleButton(element: HTMLElement): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if (typeof (window as any).google === 'undefined') {
      console.error('Google no está inicializado');
      return;
    }

    try {
      (window as any).google.accounts.id.renderButton(
        element,
        { 
          theme: 'filled_blue', 
          size: 'large', 
          width: 250,
          text: 'continue_with'
        }
      );
    } catch (error) {
      console.error('Error renderizando botón Google:', error);
    }
  }

  showGoogleOneTap(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if (typeof (window as any).google === 'undefined') {
      console.error('Google no está inicializado');
      return;
    }

    try {
      (window as any).google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.log('One-Tap no disponible');
        }
      });
    } catch (error) {
      console.error('Error en Google One-Tap:', error);
    }
  }

  // ==================== MÉTODOS DE AUTENTICACIÓN TRADICIONAL ====================

  login(email: string, password: string): Observable<User> {
    return this.api.login(email, password).pipe(
      tap((res: any) => {
        if (res?.access_token && isPlatformBrowser(this.platformId)) {
          localStorage.setItem(TOKEN_KEY, res.access_token);
        }
      }),
      switchMap(() => this.fetchCurrentUser())
    );
  }

  fetchCurrentUser(): Observable<User> {
    return this.api.getCurrentUser().pipe(
      tap((user: User) => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem(USER_KEY, JSON.stringify(user));
        }
        this.currentUser$.next(user);
      })
    );
  }

  getCurrentUser$(): Observable<User | null> {
    return this.currentUser$.asObservable();
  }

  getCurrentUser(): User | null {
    return this.currentUser$.getValue();
  }

  isLoggedIn(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    return !!localStorage.getItem(TOKEN_KEY);
  }

  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      
      // Opcional: Cerrar sesión de Google también
      if (typeof (window as any).google !== 'undefined') {
        (window as any).google.accounts.id.disableAutoSelect();
      }
    }
    this.currentUser$.next(null);
  }

  isAuthenticated(): boolean {
    return this.isLoggedIn();
  }

  // ==================== VERIFICACIONES DE ROL ====================

  hasRole(requiredRoleId: number): boolean {
    const user = this.getCurrentUser();
    return user ? user.rol.rol_id === requiredRoleId : false;
  }

  isNormalUser(): boolean {
    return this.hasRole(this.ROLES.USUARIO_NORMAL);
  }

  isAdmin(): boolean {
    return this.hasRole(this.ROLES.ADMIN);
  }

  isSuperAdmin(): boolean {
    return this.hasRole(this.ROLES.SUPER_ADMIN);
  }

  getRoleName(): string {
    const user = this.getCurrentUser();
    if (!user) return 'No autenticado';
    return this.ROLE_NAMES[user.rol.rol_id] || user.rol.nombre;
  }

  canAccessAdminPanel(): boolean {
    return this.isAdmin() || this.isSuperAdmin();
  }

  canManageUsers(): boolean {
    return this.isSuperAdmin();
  }

  canUploadFiles(): boolean {
    return this.isAdmin() || this.isSuperAdmin();
  }

  hasRoleByName(roleName: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.rol.nombre === roleName : false;
  }

  getExactRoleName(): string {
    const user = this.getCurrentUser();
    return user ? user.rol.nombre : 'no_autenticado';
  }
}