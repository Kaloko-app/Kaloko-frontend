import { Routes } from '@angular/router';

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
    loadComponent: () => import('./features/dashboard/dashboard-page.component').then(m => m.DashboardPageComponent)
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }
];
