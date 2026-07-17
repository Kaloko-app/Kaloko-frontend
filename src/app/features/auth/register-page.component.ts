import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { AuthService } from './auth.service';
import { RegisterFormComponent } from './register-form.component';
import { RegisterFormData } from './auth.model';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [RegisterFormComponent, RouterLink],
  templateUrl: './register-page.component.html',
  styles: ``
})
export class RegisterPageComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  public errorSignal = signal<string | null>(null);

  onRegister(formData: RegisterFormData) {
    const registerData = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      gender: formData.gender
    };

    this.authService.register(registerData).pipe(
      switchMap((response) => {
        const metricsData = {
          userId: response.user.id,
          currentWeight: formData.currentWeight,
          weightGoal: formData.weightGoal,
          height: formData.height,
          age: formData.age,
          activityLevel: formData.activityLevel,
          gender: formData.gender,
          bodyFatPercentage: formData.bodyFatPercentage || undefined
        };
        return this.authService.updateMetrics(metricsData);
      })
    ).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err: any) => {
        console.error('Registration failed', err);
        const specificError = err?.error?.message || err?.message || 'Registration failed. Please try again.';
        this.errorSignal.set(specificError);
      }
    });
  }
}
