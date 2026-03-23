import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { LanguageService } from '../../../core/services/language.service';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-diet-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  template: `
    <div class="max-w-4xl mx-auto">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-white mb-2">{{ 'Nova Geração de IA' | trans }}</h1>
        <p class="text-slate-400">{{ 'Personalize com seus dados para a IA estruturar o melhor cenário.' | trans }}</p>
      </div>

      <div class="glass-card p-6 md:p-8">
        <form [formGroup]="dietForm" (ngSubmit)="onSubmit()" class="space-y-8">
          
          <div *ngIf="error" class="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-sm">
            {{ error }}
          </div>

          <!-- Section 1: Objective & Stats -->
          <div>
            <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span class="flex items-center justify-center w-6 h-6 rounded bg-accent/20 text-accent text-xs">1</span>
              {{ 'Informação Pessoal' | trans }}
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div class="lg:col-span-2">
                <label class="input-label">{{ 'Objetivo Principal' | trans }}</label>
                <select formControlName="goal" class="input-field cursor-pointer">
                  <option [value]="1">{{ 'Hipertrofia (Ganho de Massa)' | trans }}</option>
                  <option [value]="2">{{ 'Perda de Peso / Emagrecimento' | trans }}</option>
                  <option [value]="3">{{ 'Força / Performance' | trans }}</option>
                  <option [value]="4">{{ 'Fôlego / Resistência' | trans }}</option>
                  <option [value]="5">{{ 'Condicionamento Geral' | trans }}</option>
                </select>
              </div>
              
              <div class="lg:col-span-2">
                <label class="input-label">{{ 'Meta de Calorias' | trans }} ({{ 'Opcional' | trans }})</label>
                <input type="number" formControlName="targetCalories" class="input-field" placeholder="Ex: 2500">
                <p class="text-xs text-slate-500 mt-1 ml-1">{{ 'Deixe em branco para a IA calcular' | trans }}</p>
              </div>
              
              <div>
                <label class="input-label">{{ 'Peso Atual (kg)' | trans }}</label>
                <input type="number" step="0.1" formControlName="weight" class="input-field" [placeholder]="'Obrigatório' | trans" required>
              </div>
              
              <div>
                <label class="input-label">{{ 'Altura (cm)' | trans }}</label>
                <input type="number" formControlName="height" class="input-field" [placeholder]="'Opcional' | trans">
              </div>

              <div>
                <label class="input-label">{{ 'Idade' | trans }}</label>
                <input type="number" formControlName="age" class="input-field" [placeholder]="'Opcional' | trans">
              </div>
            </div>
          </div>

          <!-- Section 2: Preferences -->
          <div class="pt-6 border-t border-dark-border/50">
            <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span class="flex items-center justify-center w-6 h-6 rounded bg-emerald-500/20 text-emerald-400 text-xs">2</span>
              {{ 'Restrições e Preferências' | trans }}
            </h3>
            
            <div class="space-y-6">
              <div>
                <label class="input-label mb-2">{{ 'Restrições Alimentares' | trans }}</label>
                <textarea formControlName="restrictions" rows="2" class="input-field resize-none" [placeholder]="'Ex: Vegetariano, Intolerante a Lactose, Sem Amendoim...' | trans"></textarea>
              </div>
              
              <div>
                <label class="input-label">{{ 'Preferências Adicionais' | trans }}</label>
                <textarea formControlName="additionalNotes" rows="2" class="input-field resize-none" [placeholder]="'Ex: Prefiro 4 refeições grandes em vez de 6 pequenas, adoro frango...' | trans"></textarea>
              </div>
            </div>
          </div>

          <div class="pt-8 flex justify-end">
            <button type="submit" [disabled]="dietForm.invalid || isLoading" class="btn-primary min-w-[200px] !bg-accent hover:!bg-accent-hover shadow-[0_4px_14px_0_rgba(139,92,246,0.39)] hover:shadow-[0_6px_20px_rgba(139,92,246,0.23)]">
              <span *ngIf="isLoading" class="animate-pulse flex items-center gap-2">
                <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                {{ 'Gerando plano com Inteligência Artificial...' | trans }}
              </span>
              <span *ngIf="!isLoading">{{ 'Gerar Plano Alimentar' | trans }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class DietFormComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  public langService = inject(LanguageService);

  dietForm = this.fb.group({
    goal: [1, Validators.required],
    weight: [null as number | null, Validators.required],
    height: [null as number | null],
    age: [null as number | null],
    targetCalories: [null as number | null],
    restrictions: [''],
    additionalNotes: ['']
  });

  isLoading = false;
  error = '';

  onSubmit() {
    if (this.dietForm.invalid) {
      this.dietForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.error = '';

    const payload = {
      ...this.dietForm.value,
      goal: Number(this.dietForm.value.goal),
      language: this.langService.currentLang()
    };

    this.http.post<any>(`${environment.apiUrl}/diet/generate`, payload)
      .subscribe({
        next: (diet) => {
          this.router.navigate(['/diets', diet.id]);
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to generate diet. Make sure your API key is valid.';
          this.isLoading = false;
        }
      });
  }
}
