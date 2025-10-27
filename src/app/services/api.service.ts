import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User } from '../models/user'; 
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators'; // 👈 Y aquí "catchError"

export const TOKEN_KEY = 'token';
export const USER_KEY = 'current_user';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://127.0.0.1:8000';  // tu backend FastAPI
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Cargar usuario desde localStorage solo si estamos en el navegador
    const storedUser = this.getUserFromStorage();
    if (storedUser) {
      this.currentUserSubject.next(storedUser);
    }
  }

  // =============================
  // 🔐 LOGIN
  // =============================
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((response: any) => {
        const token = response?.access_token ?? null;
        if (token && isPlatformBrowser(this.platformId)) {
          localStorage.setItem(TOKEN_KEY, token);
          this.getCurrentUser().subscribe();
        }
      })
    );
  }

  // =============================
  // 🧾 REGISTRO DE USUARIO
  // =============================
  registerUser(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  // =============================
  // 👤 OBTENER USUARIO ACTUAL (/users/me)
  // =============================
  getCurrentUser(): Observable<User> {
    const headers = this.getAuthHeaders();
    return this.http.get<User>(`${this.apiUrl}/users/me`, { headers }).pipe(
      tap(user => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem(USER_KEY, JSON.stringify(user));
        }
        this.currentUserSubject.next(user);
      })
    );
  }

  // =============================
  // 📂 SUBIDA DE ARCHIVOS
  // =============================
  uploadCSV(formData: FormData): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/upload_csv/`, formData, { headers });
  }

  uploadC3D(formData: FormData): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/upload_c3d/`, formData, { headers });
  }

  // =============================
  // 🚪 CERRAR SESIÓN
  // =============================
  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    this.currentUserSubject.next(null);
  }

  // =============================
  // ⚙️ UTILIDADES PRIVADAS
  // =============================
  private getUserFromStorage(): User | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

    private getAuthHeaders(): HttpHeaders {
      const token = isPlatformBrowser(this.platformId)
        ? localStorage.getItem(TOKEN_KEY)
        : null;

      return new HttpHeaders({
        'Authorization': token ? `Bearer ${token}` : ''
      });
    }

  getFiles() {
    return this.http.get<any[]>(`${this.apiUrl}/lista_archivos/`);
  }


  actualizarArchivo(nombre: string, formData: FormData) {
    return this.http.put(`${this.apiUrl}/archivo/${encodeURIComponent(nombre)}`, formData);
  }

  eliminarArchivo(nombre: string) {
    return this.http.delete(`${this.apiUrl}/archivo/${encodeURIComponent(nombre)}`);
  }

  getSessionLogs(): Observable<any> {
    const token = localStorage.getItem(TOKEN_KEY);
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.get(`${this.apiUrl}/admin/session-logs/`, { headers });
  }

    // =============================
  // 👥 GESTIÓN DE USUARIOS (ADMIN)
  // =============================

  // 📄 Obtener lista de todos los usuarios
  getAllUsers(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(`${this.apiUrl}/admin/users/`, { headers });
  }

  // 🔍 Obtener usuario por ID
  getUserById(userId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(`${this.apiUrl}/admin/users/${userId}`, { headers });
  }

  // 🔢 Obtener cantidad total de usuarios
  getUserCount(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(`${this.apiUrl}/admin/user-count/`, { headers });
  }

  // 🗑️ Eliminar usuario (solo superadmin)
  deleteUser(userId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete<any>(`${this.apiUrl}/admin/users/${userId}`, { headers });
  }

  // 🔑 Actualizar contraseña de usuario
  updateUserPassword(userId: number, newPassword: string): Observable<any> {
  const headers = this.getAuthHeaders();
  const body = { new_password: newPassword };
  return this.http.put(`${this.apiUrl}/admin/users/${userId}/password`, body, { headers });
  }

  crearAdministrador(adminData: any): Observable<any> {
    const token = localStorage.getItem('token'); // o TOKEN_KEY si ya lo defines así
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.post(`${this.apiUrl}/create_admin`, adminData, { headers });
  }

    // =============================
  // 🎥 OBTENER DATOS 3D (CSV o C3D)
  // =============================
getData3D(nombreArchivo: string): Observable<any> {
  if (!isPlatformBrowser(this.platformId)) {
    console.warn('⚠️ getData3D ejecutado fuera del navegador');
    return of(null);
  }

  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    console.error('❌ No hay token disponible');
    return of(null);
  }

  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`,
  });

  return this.http.get<any>(
    `${this.apiUrl}/data/3d?nombre_archivo=${encodeURIComponent(nombreArchivo)}`,
    { headers }
  );
}

// =============================
// 📄 LISTA DE ARCHIVOS
// =============================
getArchivos(): Observable<string[]> {
  if (!isPlatformBrowser(this.platformId)) {
    console.warn('⚠️ getArchivos ejecutado fuera del navegador');
    return of([]);
  }

  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    console.error('❌ No hay token disponible');
    return of([]);
  }

  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`,
  });

  return this.http.get<string[]>(`${this.apiUrl}/lista_archivos/`, { headers }).pipe(
    tap(() => console.log('✅ Archivos obtenidos correctamente')),
    catchError(err => {
      console.error('🚨 Error al obtener lista de archivos:', err);
      return of([]);
    })
  );
}
// =============================
// 📂 LISTA DE ARCHIVOS COMPLETA (PARA ADMIN)
// =============================
getArchivosCompletos(): Observable<string[]> {
  if (!isPlatformBrowser(this.platformId)) {
    console.warn('⚠️ getArchivosCompletos ejecutado fuera del navegador');
    return of([]);
  }

  const headers = this.getAuthHeaders();

  return this.http.get<string[]>(`${this.apiUrl}/lista_archivos/`, { headers }).pipe(
    tap((archivos) => console.log('✅ Archivos completos obtenidos:', archivos)),
    catchError(err => {
      console.error('🚨 Error al obtener archivos completos:', err);
      return of([]);
    })
  );
}
}