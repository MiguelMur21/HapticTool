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

  constructor(
    private api: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Al iniciar, intenta cargar user desde localStorage solo si estamos en navegador
    if (isPlatformBrowser(this.platformId)) {
      const raw = localStorage.getItem(USER_KEY);
      if (raw) {
        this.currentUser$.next(JSON.parse(raw));
      }
    }
  }

  // 🔹 LOGIN
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

  // 🔹 Cargar usuario actual desde el backend
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

  // 🔹 Observable del usuario actual
  getCurrentUser$(): Observable<User | null> {
    return this.currentUser$.asObservable();
  }

  // 🔹 Obtener rol actual
  getUserRole(): string | null {
    const u = this.currentUser$.getValue();
    return u ? u.rol?.nombre || null : null;
  }

  // 🔹 Saber si hay sesión activa
  isLoggedIn(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    return !!localStorage.getItem(TOKEN_KEY);
  }

  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    this.currentUser$.next(null);
  }

  isAuthenticated(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    const token = localStorage.getItem('token');
    return !!token;
  }
}
