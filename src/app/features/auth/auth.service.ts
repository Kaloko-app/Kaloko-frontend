import { Service, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, Observable } from 'rxjs';
import { LoginRequestDTO, RegisterRequestDTO, AuthResponseDTO, UserMetricsRequestDTO, UserResponseDTO } from './auth.model';

@Service()
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly API_URL = '/api/users';

  private readonly tokenSignal = signal<string | null>(this.getStoredToken());
  private readonly userSignal = signal<AuthResponseDTO['user'] | null>(this.getStoredUser());

  public readonly isAuthenticated = computed(() => this.tokenSignal() !== null);
  public readonly currentUser = computed(() => this.userSignal());

  constructor() {}

  login(credentials: LoginRequestDTO): Observable<AuthResponseDTO> {
    return this.http.post<AuthResponseDTO>(`${this.API_URL}/login`, credentials).pipe(
      tap(response => this.handleAuthSuccess(response))
    );
  }

  register(credentials: RegisterRequestDTO): Observable<AuthResponseDTO> {
    return this.http.post<AuthResponseDTO>(`${this.API_URL}/register`, credentials).pipe(
      tap(response => this.handleAuthSuccess(response))
    );
  }

  updateMetrics(metrics: UserMetricsRequestDTO): Observable<UserResponseDTO> {
    return this.http.put<UserResponseDTO>(`${this.API_URL}/metrics`, metrics).pipe(
      tap(updatedUser => {
        // Update stored user details after metrics are successfully set
        const currentUser = this.userSignal();
        if (currentUser) {
          const newUser = { ...currentUser, ...updatedUser };
          localStorage.setItem('currentUser', JSON.stringify(newUser));
          this.userSignal.set(newUser);
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
    this.tokenSignal.set(null);
    this.userSignal.set(null);
    this.router.navigate(['/login']);
  }

  private handleAuthSuccess(response: AuthResponseDTO) {
    localStorage.setItem('accessToken', response.token);
    localStorage.setItem('refreshToken', response.refreshToken);
    localStorage.setItem('currentUser', JSON.stringify(response.user));
    this.tokenSignal.set(response.token);
    this.userSignal.set(response.user);
  }

  public getToken(): string | null {
    return this.tokenSignal();
  }

  private getStoredToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  private getStoredUser(): AuthResponseDTO['user'] | null {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }
}
