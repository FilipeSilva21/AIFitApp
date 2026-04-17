import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, TranslatePipe],
  template: `
    <div class="space-y-6 lg:space-y-8">
      
      <!-- Welcome Header -->
      <div class="glass-card p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-primary/20 bg-gradient-to-br from-dark-card/80 to-primary/5">
        <div>
          <h1 class="text-3xl font-bold text-white mb-2">{{ 'Bem vindo(a) de volta' | trans }}, <span class="text-gradient">{{ userName }}</span>!</h1>
          <p class="text-slate-400 max-w-xl">{{ 'Pronto para esmagar seus objetivos hoje? Seu assistente de IA está pronto para traçar seu próximo passo.' | trans }}</p>
        </div>
        <div class="flex gap-4">
          <a routerLink="/workouts/generate" class="btn-primary whitespace-nowrap group">
            <lucide-icon name="plus" [size]="18" class="mr-2"></lucide-icon> {{ 'Novo Treino' | trans }}
          </a>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div class="glass-card p-5 border-l-4 border-l-primary hover:-translate-y-1 transition-transform">
          <div class="flex justify-between items-start mb-4">
            <div class="p-2 bg-primary/20 text-primary rounded-lg">
              <lucide-icon name="dumbbell" [size]="20"></lucide-icon>
            </div>
            <span class="text-xs font-semibold px-2 py-1 bg-dark-bg rounded-md text-slate-400">{{ 'Total' | trans }}</span>
          </div>
          <h3 class="text-3xl font-bold text-white mb-1">{{ stats.workouts }}</h3>
          <p class="text-sm text-slate-400">{{ 'Treinos Criados' | trans }}</p>
        </div>

        <div class="glass-card p-5 border-l-4 border-l-accent hover:-translate-y-1 transition-transform">
          <div class="flex justify-between items-start mb-4">
            <div class="p-2 bg-accent/20 text-accent rounded-lg">
              <lucide-icon name="utensils" [size]="20"></lucide-icon>
            </div>
            <span class="text-xs font-semibold px-2 py-1 bg-dark-bg rounded-md text-slate-400">{{ 'Total' | trans }}</span>
          </div>
          <h3 class="text-3xl font-bold text-white mb-1">{{ stats.diets }}</h3>
          <p class="text-sm text-slate-400">{{ 'Dietas Geradas' | trans }}</p>
        </div>

        <div class="glass-card p-5 border-l-4 border-l-emerald-500 hover:-translate-y-1 transition-transform">
          <div class="flex justify-between items-start mb-4">
            <div class="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <lucide-icon name="target" [size]="20"></lucide-icon>
            </div>
            <span class="text-xs font-semibold px-2 py-1 bg-dark-bg rounded-md text-slate-400">{{ 'Atual' | trans }}</span>
          </div>
          <h3 class="text-lg font-bold text-white mb-1 truncate">{{ stats.goal | trans }}</h3>
          <p class="text-sm text-slate-400">{{ 'Objetivo Atual' | trans }}</p>
        </div>

        <div class="glass-card p-5 border-l-4 border-l-amber-500 hover:-translate-y-1 transition-transform">
          <div class="flex justify-between items-start mb-4">
            <div class="p-2 bg-amber-500/20 text-amber-500 rounded-lg">
              <lucide-icon name="trending-up" [size]="20"></lucide-icon>
            </div>
            <span class="text-xs font-semibold px-2 py-1 bg-dark-bg rounded-md text-slate-400">{{ 'Último' | trans }}</span>
          </div>
          <h3 class="text-3xl font-bold text-white mb-1">{{ stats.weight }}<span class="text-lg text-slate-500 ml-1">kg</span></h3>
          <p class="text-sm text-slate-400">{{ 'Peso Atual' | trans }}</p>
        </div>
      </div>

      <!-- Quick Actions / AI Setup Status -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- Generate Diet Card -->
        <div class="glass-card overflow-hidden group">
          <div class="h-32 bg-gradient-to-r from-accent/20 to-dark-card flex items-center p-6 border-b border-dark-border">
            <div class="flex items-center gap-4">
              <div class="p-3 bg-accent border border-accent/50 text-white rounded-xl shadow-[0_0_15px_rgba(139,92,246,0.5)]">
                <lucide-icon name="utensils" [size]="28"></lucide-icon>
              </div>
              <div>
                <h3 class="text-xl font-bold text-white">{{ 'Gerar Dieta' | trans }}</h3>
                <p class="text-slate-400 text-sm">{{ 'Precisa de um novo plano alimentar? Deixe a IA criar para você.' | trans }}</p>
              </div>
            </div>
          </div>
          <div class="p-6">
            <a routerLink="/diets/generate" class="flex items-center justify-between text-accent hover:text-accent-hover font-semibold transition-colors">
              {{ 'Iniciar Geração' | trans }} <lucide-icon name="arrow-right" [size]="18" class="group-hover:translate-x-1 transition-transform"></lucide-icon>
            </a>
          </div>
        </div>

        <!-- AI Connection Status -->
        <div class="glass-card flex items-center justify-between p-6 h-full">
          <div class="flex items-center gap-4">
            <div class="p-4 rounded-xl shadow-lg border" 
              [ngClass]="aiConfigured ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-red-500/20 border-red-500/50 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]'">
              <lucide-icon name="zap" [size]="28"></lucide-icon>
            </div>
            <div>
              <h3 class="text-xl font-bold text-white">{{ 'Cérebro da IA' | trans }}</h3>
              <p class="text-slate-400 text-sm">
                {{ (aiConfigured ? 'Conectado e Pronto' : 'Não Conectado! Treinos/Dietas desativados.') | trans }}
              </p>
            </div>
          </div>
          <a [routerLink]="aiConfigured ? '/profile' : '/ai-setup'" class="btn-secondary text-sm px-4 py-2">
            {{ (aiConfigured ? 'Gerenciar' : 'Configurar') | trans }}
          </a>
        </div>
      </div>

    </div>
  `
})
export class DashboardComponent implements OnInit {
  private http = inject(HttpClient);
  

  
  userName = 'Athlete';
  aiConfigured = false;
  stats = {
    workouts: 0,
    diets: 0,
    goal: 'Carregando...',
    weight: '--'
  };

  ngOnInit() {
    // Decode token just to get the name for UI fast loading
    const token = localStorage.getItem('aifit_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.userName = payload.unique_name || payload.name || 'Athlete';
      } catch (e) {}
    }

    // Load actual data
    this.http.get<any>(`${environment.apiUrl}/aisettings/status`).subscribe(res => {
      this.aiConfigured = res.isConfigured;
    });

    this.http.get<any>(`${environment.apiUrl}/workout`).subscribe(res => {
      this.stats.workouts = Array.isArray(res) ? res.length : 0;
    });

    this.http.get<any>(`${environment.apiUrl}/diet`).subscribe(res => {
      this.stats.diets = Array.isArray(res) ? res.length : 0;
    });

    this.http.get<any>(`${environment.apiUrl}/profile`).subscribe({
      next: (res) => {
        console.log('Dashboard profile loaded:', JSON.stringify(res));
        const rawGoal = res?.goal ?? res?.Goal ?? 5;
        
        // Ultra-resilient mapping
        let goalId: number;
        if (typeof rawGoal === 'number') {
          goalId = rawGoal;
        } else {
          const map: Record<string, number> = {
            'Hypertrophy': 1, 'WeightLoss': 2, 'Strength': 3, 'Endurance': 4, 'GeneralFitness': 5,
            '1': 1, '2': 2, '3': 3, '4': 4, '5': 5
          };
          goalId = map[String(rawGoal).trim()] || 5;
        }

        const weightVal = res?.weight ?? res?.Weight;
        this.stats.goal = this.formatGoal(goalId);
        this.stats.weight = weightVal?.toString() || '--';
      },
      error: (err) => {
        console.error('Error loading profile in dashboard:', err);
        this.stats.goal = 'Erro ao carregar';
      }
    });
  }

  private formatGoal(goalEnumVal: number): string {
    const goals: Record<number, string> = {
      1: 'Hipertrofia (Ganho de Massa)',
      2: 'Perda de Peso / Emagrecimento',
      3: 'Força / Performance',
      4: 'Fôlego / Resistência',
      5: 'Condicionamento Geral'
    };
    return goals[goalEnumVal] || 'Condicionamento Geral';
  }
}
