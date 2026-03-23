import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-ai-setup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-hero-glow opacity-20 pointer-events-none"></div>
      
      <div class="glass-card w-full max-w-lg p-8 relative z-10 animate-slide-up">
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 text-primary mb-4">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <h1 class="text-3xl font-bold mb-2 text-gradient">Connect Your AI</h1>
          <p class="text-slate-400">AIFit uses your own AI API key to generate customized workouts and diets.</p>
        </div>

        <form [formGroup]="setupForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <div *ngIf="error" class="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-sm">
            {{ error }}
          </div>
          <div *ngIf="success" class="p-4 bg-emerald-500/10 border border-emerald-500/50 rounded-xl text-emerald-400 text-sm flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            Successfully connected! Redirecting...
          </div>

          <div>
            <label class="input-label" for="provider">AI Provider</label>
            <div class="grid grid-cols-2 gap-4 mt-2">
              <!-- OpenAI Option -->
              <div class="relative">
                <input type="radio" id="openai" value="OpenAI" formControlName="provider" class="peer sr-only">
                <label for="openai" class="flex flex-col items-center justify-center p-4 bg-dark-bg/50 border border-dark-border rounded-xl cursor-pointer hover:bg-slate-800 peer-checked:border-primary peer-checked:bg-primary/10 transition-all">
                  <span class="font-semibold text-slate-200">OpenAI</span>
                  <span class="text-xs text-slate-500 mt-1">ChatGPT</span>
                </label>
              </div>

              <!-- Gemini Option -->
              <div class="relative">
                <input type="radio" id="gemini" value="Gemini" formControlName="provider" class="peer sr-only">
                <label for="gemini" class="flex flex-col items-center justify-center p-4 bg-dark-bg/50 border border-dark-border rounded-xl cursor-pointer hover:bg-slate-800 peer-checked:border-accent peer-checked:bg-accent/10 transition-all hover:border-accent/50">
                  <span class="font-semibold text-slate-200">Google Gemini</span>
                  <span class="text-xs text-slate-500 mt-1">Gemini 2.5 Pro</span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <label class="input-label" for="apiKey">API Key</label>
            <!-- Dynamic accent border based on provider -->
            <input type="password" id="apiKey" formControlName="apiKey" class="input-field" placeholder="sk-..." [class.border-accent]="setupForm.value.provider === 'Gemini'" [class.focus:ring-accent]="setupForm.value.provider === 'Gemini'">
            <p class="text-xs text-slate-500 mt-2 ml-1">
              <span *ngIf="setupForm.value.provider === 'OpenAI'">Get your key from <a href="https://platform.openai.com/api-keys" target="_blank" class="text-primary hover:underline">OpenAI Dashboard</a></span>
              <span *ngIf="setupForm.value.provider === 'Gemini'">Get your key from <a href="https://aistudio.google.com/app/apikey" target="_blank" class="text-accent hover:underline">Google AI Studio</a></span>
            </p>
          </div>

          <button type="submit" [disabled]="setupForm.invalid || isLoading || success" 
            [ngClass]="setupForm.value.provider === 'Gemini' ? 'bg-accent hover:bg-accent-hover shadow-[0_4px_14px_0_rgba(139,92,246,0.39)] hover:shadow-[0_6px_20px_rgba(139,92,246,0.23)]' : 'btn-primary'" 
            class="relative inline-flex items-center justify-center px-6 py-3 font-semibold text-white transition-all duration-300 rounded-xl w-full active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
            <span *ngIf="isLoading" class="animate-pulse flex items-center gap-2">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Verifying Connection...
            </span>
            <span *ngIf="!isLoading">Connect AI & Continue</span>
          </button>
          
          <div class="text-center mt-4">
            <button type="button" (click)="skip()" class="text-sm text-slate-500 hover:text-slate-300 transition-colors">Skip for now</button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class AiSetupComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);

  setupForm = this.fb.group({
    provider: ['Gemini', Validators.required], // Default to Gemini
    apiKey: ['', Validators.required]
  });

  isLoading = false;
  error = '';
  success = false;

  ngOnInit() {
    // Check if already configured
    this.http.get<any>(`${environment.apiUrl}/aisettings/status`).subscribe(res => {
      if (res.isConfigured) {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  onSubmit() {
    if (this.setupForm.invalid) return;

    this.isLoading = true;
    this.error = '';

    this.http.post<any>(`${environment.apiUrl}/aisettings/connect`, this.setupForm.value)
      .subscribe({
        next: () => {
          this.success = true;
          this.isLoading = false;
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 1500);
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to connect. Please check your API key.';
          this.isLoading = false;
        }
      });
  }
  
  skip() {
    this.router.navigate(['/dashboard']);
  }
}
