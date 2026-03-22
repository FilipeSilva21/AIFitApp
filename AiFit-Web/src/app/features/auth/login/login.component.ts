import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-hero-glow opacity-20 pointer-events-none"></div>
      
      <div class="glass-card w-full max-w-md p-8 relative z-10 animate-slide-up">
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-gradient mb-2">AIFit</h1>
          <p class="text-slate-400">Welcome back! Sign in to continue.</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <div *ngIf="error" class="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-sm">
            {{ error }}
          </div>

          <div>
            <label class="input-label" for="email">Email</label>
            <input type="email" id="email" formControlName="email" class="input-field" placeholder="you@example.com">
          </div>

          <div>
            <label class="input-label" for="password">Password</label>
            <input type="password" id="password" formControlName="password" class="input-field" placeholder="••••••••">
          </div>

          <button type="submit" [disabled]="loginForm.invalid || isLoading" class="btn-primary w-full">
            <span *ngIf="isLoading" class="animate-pulse">Signing in...</span>
            <span *ngIf="!isLoading">Sign In</span>
          </button>
        </form>

        <div class="mt-8 text-center text-sm text-slate-400">
          Don't have an account? 
          <a routerLink="/register" class="text-primary hover:text-primary-hover font-semibold transition-colors">Sign up</a>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private authService = inject(AuthService);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  isLoading = false;
  error = '';

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.error = '';

    this.http.post<any>(`${environment.apiUrl}/auth/login`, this.loginForm.value)
      .subscribe({
        next: (res) => {
          this.authService.setToken(res.token);
          if (!res.hasAIProvider) {
            this.router.navigate(['/ai-setup']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to login';
          this.isLoading = false;
        }
      });
  }
}
