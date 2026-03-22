import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { DashboardLayoutComponent } from './shared/layouts/dashboard-layout.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { AiSetupComponent } from './features/profile/ai-setup/ai-setup.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  
  // Protected routes inside the dashboard layout
  { 
    path: '', 
    component: DashboardLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'ai-setup', component: AiSetupComponent },
      
      // We will define these feature modules/components next
      { path: 'workouts', loadChildren: () => import('./features/workouts/workouts.routes').then(m => m.WORKOUT_ROUTES) },
      { path: 'diets', loadChildren: () => import('./features/diets/diets.routes').then(m => m.DIET_ROUTES) },
      { path: 'measurements', loadComponent: () => import('./features/measurements/measurements.component').then(m => m.MeasurementsComponent) },
      { path: 'profile', loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent) },
      
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  
  { path: '**', redirectTo: 'dashboard' }
];
