import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { LanguageService } from '../../core/services/language.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, LucideAngularModule, TranslatePipe],
  template: `
    <div class="max-w-4xl mx-auto space-y-6">
      
      <div>
        <h1 class="text-3xl font-bold text-white">{{ 'Configurações e Perfil' | trans }}</h1>
        <p class="text-slate-400">{{ 'Gerencie suas informações pessoais e a configuração da IA.' | trans }}</p>
      </div>

      <!-- AI Configuration Card -->
      <div class="glass-card overflow-hidden">
        <div class="bg-dark-card p-6 border-b border-dark-border flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-secondary/20 text-secondary rounded-lg">
              <lucide-icon name="zap" [size]="20"></lucide-icon>
            </div>
            <h2 class="text-lg font-bold text-white">{{ 'Configuração da Inteligência Artificial' | trans }}</h2>
          </div>
          <span *ngIf="aiConfigured" class="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
            {{ aiProvider === 'Ollama' ? 'Ollama (Local)' : aiProvider }}
          </span>
          <span *ngIf="!aiConfigured" class="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center">
            {{ 'Padrão do Servidor' | trans }}
          </span>
        </div>
        
        <div class="p-6">
          <div *ngIf="!aiConfigured" class="text-center py-6">
            <p class="text-slate-400 mb-6 max-w-[420px] mx-auto text-sm">{{ 'Você está utilizando a IA global configurada no ambiente (.env). Escolha outra IA se desejar sobrescrever o roteamento unicamente para sua conta.' | trans }}</p>
            
            <form [formGroup]="aiForm" (ngSubmit)="connectAI()" class="max-w-md mx-auto space-y-4">
              <div class="text-left">
                <label class="input-label">{{ 'Provedor de IA Customizado' | trans }}</label>
                <select formControlName="provider" class="input-field cursor-pointer">
                  <option [value]="1">OpenAI (ChatGPT)</option>
                  <option [value]="2">Google Gemini</option>
                  <option [value]="3">{{ 'Ollama Local (Ilimitado e Off-line)' | trans }}</option>
                </select>
              </div>

              <div class="text-left" *ngIf="aiForm.get('provider')?.value != 3">
                <label class="input-label">{{ 'Chave API (Secret Key)' | trans }}</label>
                <input type="password" formControlName="apiKey" class="input-field" [placeholder]="'Insira sua Chave API...' | trans">
              </div>

              <div class="text-left" *ngIf="aiForm.get('provider')?.value == 3">
                <p class="text-emerald-400 text-sm py-2 px-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                  {{ 'Ollama será executado 100% nativo no seu computador ("localhost:11434"). Nenhuma chave remota é cobrada.' | trans }}
                </p>
              </div>

              <button type="submit" [disabled]="isConnecting || (aiForm.get('provider')?.value != 3 && !aiForm.get('apiKey')?.value)" class="btn-primary w-full shadow-lg shadow-primary/25">
                <span *ngIf="isConnecting" class="animate-pulse">{{ 'Validando Comunicação...' | trans }}</span>
                <span *ngIf="!isConnecting">{{ 'Definir Preferência' | trans }}</span>
              </button>
            </form>
          </div>

          <div *ngIf="aiConfigured" class="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-dark-border bg-dark-bg/50">
            <div>
              <p class="text-slate-400 text-sm">{{ 'Sua conta forçará a geração pelo modelo customizado gravado. Você pode remover isto se quiser retornar ao provedor base do código.' | trans }}</p>
            </div>
            <button (click)="disconnectAI()" class="btn-danger whitespace-nowrap">
              {{ 'Remover Modificação' | trans }} 
            </button>
          </div>
        </div>
      </div>

      <!-- App Preferences Card (Language) -->
      <div class="glass-card overflow-hidden">
        <div class="bg-dark-card p-6 border-b border-dark-border flex items-center gap-3">
          <div class="p-2 bg-accent/20 text-accent rounded-lg">
            <lucide-icon name="languages" [size]="20"></lucide-icon>
          </div>
          <h2 class="text-lg font-bold text-white">{{ 'Preferências do Aplicativo' | trans }}</h2>
        </div>
        
        <div class="p-6">
          <div class="flex flex-col md:flex-row items-center justify-between gap-6">
            <div class="max-w-md">
              <h3 class="text-white font-semibold mb-1">{{ 'Idioma do Sistema' | trans }}</h3>
              <p class="text-slate-400 text-sm">{{ 'Escolha como a plataforma deve ser exibida para você.' | trans }}</p>
            </div>
            
            <div class="w-full md:w-64">
              <div class="flex items-center gap-2 p-3 bg-dark-bg/50 rounded-xl border border-dark-border/50">
                <lucide-icon name="globe" [size]="18" class="text-slate-500"></lucide-icon>
                <select [ngModel]="langService.currentLang()" (ngModelChange)="langService.setLanguage($any($event))" 
                  class="bg-transparent text-sm font-medium text-slate-200 border-none focus:ring-0 cursor-pointer w-full">
                  <option value="pt">Português (Brasil)</option>
                  <option value="en">English (United States)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Profile Settings Card -->
      <div class="glass-card overflow-hidden">
        <div class="bg-dark-card p-6 border-b border-dark-border flex items-center gap-3">
          <div class="p-2 bg-primary/20 text-primary rounded-lg">
            <lucide-icon name="user" [size]="20"></lucide-icon>
          </div>
          <h2 class="text-lg font-bold text-white">{{ 'Informação Pessoal' | trans }}</h2>
        </div>
        
        <div class="p-6">
          <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="space-y-6">
            
            <div *ngIf="saveSuccess" class="p-4 bg-emerald-500/10 border border-emerald-500/50 rounded-xl text-emerald-400 text-sm flex items-center">
              <lucide-icon name="check-circle" [size]="18" class="mr-2"></lucide-icon> {{ 'Perfil atualizado com sucesso!' | trans }}
            </div>

            <div *ngIf="errorMessage" class="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-sm flex items-center">
              <lucide-icon name="x" [size]="18" class="mr-2"></lucide-icon> {{ errorMessage | trans }}
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="input-label">{{ 'Idade' | trans }}</label>
                <input type="number" formControlName="age" class="input-field">
              </div>
              
              <div>
                <label class="input-label">{{ 'Objetivo Principal' | trans }}</label>
                <select formControlName="goal" class="input-field cursor-pointer">
                  <option value="1">{{ 'Hipertrofia (Ganho de Massa)' | trans }}</option>
                  <option value="2">{{ 'Perda de Peso / Emagrecimento' | trans }}</option>
                  <option value="3">{{ 'Força / Performance' | trans }}</option>
                  <option value="4">{{ 'Fôlego / Resistência' | trans }}</option>
                  <option value="5">{{ 'Condicionamento Geral' | trans }}</option>
                </select>
              </div>

              <div>
                <label class="input-label">{{ 'Peso Atual (kg)' | trans }}</label>
                <input type="number" step="0.1" formControlName="weight" class="input-field">
              </div>

              <div>
                <label class="input-label">{{ 'Altura (cm)' | trans }}</label>
                <input type="number" formControlName="height" class="input-field">
              </div>
            </div>

            <div class="space-y-6">
              <div>
                <label class="input-label">{{ 'Experiência de Treino' | trans }}</label>
                <select formControlName="trainingExperience" class="input-field cursor-pointer">
                  <option value="Beginner (0-6 months)">{{ 'Iniciante (0-6 meses)' | trans }}</option>
                  <option value="Intermediate (6-24 months)">{{ 'Intermediário (6-24 months)' | trans }}</option>
                  <option value="Advanced (2+ years)">{{ 'Avançado (2+ years)' | trans }}</option>
                </select>
              </div>

              <div>
                <label class="input-label">{{ 'Lesões Conhecidas ou Limitações' | trans }}</label>
                <textarea formControlName="injuries" rows="3" class="input-field resize-none" [placeholder]="'Elas serão levadas em consideração ao gerar seu treino.' | trans"></textarea>
              </div>
            </div>

            <div class="pt-4 flex justify-end">
              <button type="submit" [disabled]="profileForm.invalid || isSaving" class="btn-primary min-w-[150px]">
                <span *ngIf="isSaving" class="animate-pulse">{{ 'Salvando...' | trans }}</span>
                <span *ngIf="!isSaving" class="flex items-center"><lucide-icon name="save" [size]="18" class="mr-2"></lucide-icon> {{ 'Salvar Alterações' | trans }}</span>
              </button>
            </div>

          </form>
        </div>
      </div>

    </div>
  `
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  
  public langService = inject(LanguageService);


  profileForm = this.fb.group({
    age: [null as number | null],
    weight: [null as number | null],
    height: [null as number | null],
    goal: ['5', Validators.required],
    trainingExperience: ['Beginner (0-6 months)'],
    injuries: ['']
  });

  aiForm = this.fb.group({
    provider: [3, Validators.required],
    apiKey: ['']
  });

  isConnecting = false;
  aiConfigured = false;
  aiProvider: string | null = null;
  isSaving = false;
  saveSuccess = false;

  ngOnInit() {
    this.loadProfile();
    this.loadAiStatus();
  }

  loadAiStatus() {
    this.http.get<any>(`${environment.apiUrl}/aisettings/status`).subscribe(res => {
      this.aiConfigured = res.isConfigured;
      this.aiProvider = res.provider == 1 ? 'OpenAI' : res.provider == 2 ? 'Gemini' : res.provider == 3 ? 'Ollama' : null;
      this.cdr.detectChanges();
    });
  }

  errorMessage = '';

  private mapGoalToId(goal: any): string {
    if (!goal) return '5';
    if (typeof goal === 'number') return String(goal);
    
    const goalStr = String(goal).trim();
    const map: Record<string, string> = {
      'Hypertrophy': '1',
      'WeightLoss': '2',
      'Strength': '3',
      'Endurance': '4',
      'GeneralFitness': '5',
      '1': '1', '2': '2', '3': '3', '4': '4', '5': '5'
    };
    return map[goalStr] || '5';
  }

  loadProfile() {
    this.http.get<any>(`${environment.apiUrl}/profile`).subscribe({
      next: (res) => {
        console.log('Profile loaded:', JSON.stringify(res));
        if (res) {
          const ageVal = res.age ?? res.Age;
          const weightVal = res.weight ?? res.Weight;
          const heightVal = res.height ?? res.Height;
          const goalVal = res.goal ?? res.Goal;
          const trainingExperienceVal = res.trainingExperience ?? res.TrainingExperience;
          const injuriesVal = res.injuries ?? res.Injuries;

          this.profileForm.patchValue({
            age: ageVal,
            weight: weightVal,
            height: heightVal,
            goal: this.mapGoalToId(goalVal),
            trainingExperience: trainingExperienceVal || 'Beginner (0-6 months)',
            injuries: injuriesVal || ''
          });
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error loading profile:', err);
      }
    });
  }

  saveProfile() {
    if (this.profileForm.invalid) return;
    
    this.isSaving = true;
    this.saveSuccess = false;
    this.errorMessage = '';

    const goalIdToEnum: Record<number, string> = {
      1: 'Hypertrophy',
      2: 'WeightLoss',
      3: 'Strength',
      4: 'Endurance',
      5: 'GeneralFitness'
    };
    const goalNum = Number(this.profileForm.value.goal);
    const goalStr = goalIdToEnum[goalNum] || 'GeneralFitness';
    const payload = {
      ...this.profileForm.value,
      goal: goalStr,
      Goal: goalStr
    };

    console.log('Saving profile payload:', JSON.stringify(payload));

    this.http.put(`${environment.apiUrl}/profile`, payload).subscribe({
      next: (res) => {
        console.log('Save response:', JSON.stringify(res));
        this.isSaving = false;
        this.saveSuccess = true;
        // Refresh profile data after save to confirm
        this.loadProfile();
        setTimeout(() => this.saveSuccess = false, 3000);
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMessage = err.error?.message || 'Erro ao salvar perfil.';
        console.error('Error saving profile:', err);
      }
    });
  }

  disconnectAI() {
    if (confirm('Tem certeza de que deseja remover a customização da IA? A plataforma voltará a usar as configurações automáticas padrão (.env).')) {
      this.http.delete(`${environment.apiUrl}/aisettings/disconnect`).subscribe(() => {
        this.aiConfigured = false;
        this.aiProvider = null;
      });
    }
  }

  connectAI() {
    if (this.aiForm.invalid) return;

    this.isConnecting = true;
    const { provider, apiKey } = this.aiForm.value;

    const payload = {
      provider: Number(provider),
      apiKey: provider == 3 ? "local" : apiKey
    };

    this.http.post(`${environment.apiUrl}/aisettings/connect`, payload).subscribe({
      next: () => {
        this.isConnecting = false;
        this.aiConfigured = true;
        this.aiProvider = provider == 1 ? 'OpenAI' : provider == 2 ? 'Gemini' : 'Ollama';
      },
      error: () => {
        this.isConnecting = false;
        alert('Falha ao conectar. Verifique sua chave API (se houver) ou se o motor de IA local está funcionando adequadamente na porta correspondente.');
      }
    });
  }
}
