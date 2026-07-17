import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Login - Kaloko',
    loadComponent: () => import('./features/auth/login-page.component').then(m => m.LoginPageComponent)
  },
  {
    path: 'register',
    title: 'Register - Kaloko',
    loadComponent: () => import('./features/auth/register-page.component').then(m => m.RegisterPageComponent)
  },
  {
    path: 'dashboard',
    title: 'Dashboard - Kaloko',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard-page.component').then(m => m.DashboardPageComponent)
  },
  {
    path: 'nutrition',
    title: 'Nutrition - Kaloko',
    canActivate: [authGuard],
    loadComponent: () => import('./features/nutrition/nutrition-page.component').then(m => m.NutritionPageComponent)
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }
];
