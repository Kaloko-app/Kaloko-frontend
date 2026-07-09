import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from './auth.service';
import { LoginRequestDTO } from './auth.model';
import { LoginFormComponent } from './login-form.component';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [LoginFormComponent, RouterLink],
  templateUrl: './login-page.component.html',
  styles: ``
})
export class LoginPageComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  public errorSignal = signal<string | null>(null);

  onLogin(credentials: LoginRequestDTO) {
    this.authService.login(credentials).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err: any) => {
        console.error('Login failed', err);
        const specificError = err?.error?.message || 'Invalid credentials. Please try again.';
        this.errorSignal.set(specificError);
      }
    });
  }
}
