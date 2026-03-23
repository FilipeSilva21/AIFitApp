import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { LucideAngularModule, Dumbbell, Utensils, Activity, ArrowRight, Zap, Target, TrendingUp } from 'lucide-angular';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  template: `
    <div class="space-y-6 lg:space-y-8">
      
      <!-- Welcome Header -->
      <div class="glass-card p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-primary/20 bg-gradient-to-br from-dark-card/80 to-primary/5">
        <div>
          <h1 class="text-3xl font-bold text-white mb-2">Welcome back, <span class="text-gradient">{{ userName }}</span>!</h1>
          <p class="text-slate-400 max-w-xl">Ready to crush your goals today? Your AI assistant is standing by to map out your next move.</p>
        </div>
        <div class="flex gap-4">
          <a routerLink="/workouts/generate" class="btn-primary whitespace-nowrap group">
            <lucide-icon name="plus" [size]="18" class="mr-2"></lucide-icon> New Workout
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
            <span class="text-xs font-semibold px-2 py-1 bg-dark-bg rounded-md text-slate-400">Total</span>
          </div>
          <h3 class="text-3xl font-bold text-white mb-1">{{ stats.workouts }}</h3>
          <p class="text-sm text-slate-400">Workouts Generated</p>
        </div>

        <div class="glass-card p-5 border-l-4 border-l-accent hover:-translate-y-1 transition-transform">
          <div class="flex justify-between items-start mb-4">
            <div class="p-2 bg-accent/20 text-accent rounded-lg">
              <lucide-icon name="utensils" [size]="20"></lucide-icon>
            </div>
            <span class="text-xs font-semibold px-2 py-1 bg-dark-bg rounded-md text-slate-400">Total</span>
          </div>
          <h3 class="text-3xl font-bold text-white mb-1">{{ stats.diets }}</h3>
          <p class="text-sm text-slate-400">Diets Generated</p>
        </div>

        <div class="glass-card p-5 border-l-4 border-l-emerald-500 hover:-translate-y-1 transition-transform">
          <div class="flex justify-between items-start mb-4">
            <div class="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <lucide-icon name="target" [size]="20"></lucide-icon>
            </div>
            <span class="text-xs font-semibold px-2 py-1 bg-dark-bg rounded-md text-slate-400">Current</span>
          </div>
          <h3 class="text-lg font-bold text-white mb-1 truncate">{{ stats.goal }}</h3>
          <p class="text-sm text-slate-400">Current Goal</p>
        </div>

        <div class="glass-card p-5 border-l-4 border-l-amber-500 hover:-translate-y-1 transition-transform">
          <div class="flex justify-between items-start mb-4">
            <div class="p-2 bg-amber-500/20 text-amber-500 rounded-lg">
              <lucide-icon name="trending-up" [size]="20"></lucide-icon>
            </div>
            <span class="text-xs font-semibold px-2 py-1 bg-dark-bg rounded-md text-slate-400">Latest</span>
          </div>
          <h3 class="text-3xl font-bold text-white mb-1">{{ stats.weight }}<span class="text-lg text-slate-500 ml-1">kg</span></h3>
          <p class="text-sm text-slate-400">Current Weight</p>
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
                <h3 class="text-xl font-bold text-white">Generate Diet</h3>
                <p class="text-slate-400 text-sm">Need a new meal plan? Let AI craft it for you.</p>
              </div>
            </div>
          </div>
          <div class="p-6">
            <a routerLink="/diets/generate" class="flex items-center justify-between text-accent hover:text-accent-hover font-semibold transition-colors">
              Start Generation <lucide-icon name="arrow-right" [size]="18" class="group-hover:translate-x-1 transition-transform"></lucide-icon>
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
              <h3 class="text-xl font-bold text-white">AI Brain</h3>
              <p class="text-slate-400 text-sm">
                {{ aiConfigured ? 'Connected & Ready' : 'Not Connected! Workouts/Diets disabled.' }}
              </p>
            </div>
          </div>
          <a [routerLink]="aiConfigured ? '/profile' : '/ai-setup'" class="btn-secondary text-sm px-4 py-2">
            {{ aiConfigured ? 'Manage' : 'Configure' }}
          </a>
        </div>
      </div>

    </div>
  `
})
export class DashboardComponent implements OnInit {
  private http = inject(HttpClient);
  
  readonly icons = { Dumbbell, Utensils, Activity, ArrowRight, Zap, Target, TrendingUp };
  
  userName = 'Athlete';
  aiConfigured = false;
  stats = {
    workouts: 0,
    diets: 0,
    goal: 'Loading...',
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

    this.http.get<any>(`${environment.apiUrl}/profile`).subscribe(res => {
      this.stats.goal = this.formatGoal(res?.goal || 5);
      this.stats.weight = res?.weight?.toString() || '--';
    });
  }

  private formatGoal(goalEnumVal: number): string {
    const goals: Record<number, string> = {
      1: 'Hypertrophy',
      2: 'Weight Loss',
      3: 'Strength',
      4: 'Endurance',
      5: 'General Fitness'
    };
    return goals[goalEnumVal] || 'General Fitness';
  }
}
