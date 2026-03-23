import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { LanguageService } from '../../../core/services/language.service';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { LucideAngularModule, Utensils, Calendar, Plus, Flame, ArrowRight } from 'lucide-angular';

@Component({
  selector: 'app-diet-list',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, DatePipe, TranslatePipe],
  template: `
    <div class="space-y-6">
      
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-white">{{ 'Minhas Dietas' | trans }}</h1>
          <p class="text-slate-400">{{ 'Todos os seus planos alimentares gerados por IA.' | trans }}</p>
        </div>
        <a routerLink="/diets/generate" class="btn-primary whitespace-nowrap !bg-accent hover:!bg-accent-hover shadow-[0_4px_14px_0_rgba(139,92,246,0.39)]">
          <lucide-icon name="plus" [size]="18" class="mr-2"></lucide-icon> {{ 'Gerar Novo' | trans }}
        </a>
      </div>

      <div *ngIf="isLoading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>

      <div *ngIf="!isLoading && diets.length === 0" class="glass-card p-12 text-center border-dashed border-dark-border border-2">
        <div class="w-16 h-16 rounded-full bg-dark-bg/50 border border-dark-border text-slate-500 flex items-center justify-center mx-auto mb-4">
          <lucide-icon name="utensils" [size]="32"></lucide-icon>
        </div>
        <h3 class="text-xl font-bold text-white mb-2">{{ 'Nenhuma dieta ainda' | trans }}</h3>
        <p class="text-slate-400 max-w-sm mx-auto mb-6">{{ 'Você não gerou nenhum plano alimentar. Deixe nossa IA montar a estratégia nutricional perfeita para você.' | trans }}</p>
        <a routerLink="/diets/generate" class="btn-primary !bg-accent hover:!bg-accent-hover shadow-[0_4px_14px_0_rgba(139,92,246,0.39)]">{{ 'Começar agora' | trans }}</a>
      </div>

      <div *ngIf="!isLoading && diets.length > 0" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        
        <a *ngFor="let diet of diets" [routerLink]="['/diets', diet.id]" 
           class="glass-card p-6 border-transparent hover:border-accent/50 group block">
          
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-lg font-bold text-white group-hover:text-accent transition-colors line-clamp-1">{{ diet.name }}</h3>
          </div>
          
          <div class="space-y-3 mb-6">
            <div class="flex items-center text-sm text-slate-400">
              <lucide-icon name="calendar" [size]="16" class="mr-2"></lucide-icon>
              {{ diet.createdAt | date:'mediumDate' }}
            </div>
            
            <div class="flex items-center text-sm text-slate-400">
              <lucide-icon name="utensils" [size]="16" class="mr-2"></lucide-icon>
              {{ diet.meals?.length || 0 }} {{ 'refeições' | trans }}
            </div>

            <div class="flex items-center text-sm font-semibold text-accent mt-2 p-2 bg-accent/10 rounded-lg inline-flex">
              <lucide-icon name="flame" [size]="16" class="mr-2"></lucide-icon>
              {{ (diet.totalCalories || 'Calculado automaticamente') | trans }} {{ 'kcal/dia' | trans }}
            </div>
          </div>

          <div class="mt-6 pt-4 border-t border-dark-border flex justify-between items-center text-sm font-semibold text-slate-400 group-hover:text-accent transition-colors">
            {{ 'Ver detalhes' | trans }}
            <lucide-icon name="arrow-right" [size]="16" class="group-hover:translate-x-1 transition-transform"></lucide-icon>
          </div>
        </a>

      </div>
    </div>
  `
})
export class DietListComponent implements OnInit {
  private http = inject(HttpClient);
  
  public langService = inject(LanguageService);
  readonly icons = { Utensils, Calendar, Plus, Flame, ArrowRight };

  diets: any[] = [];
  isLoading = true;

  ngOnInit() {
    this.http.get<any[]>(`${environment.apiUrl}/diet`).subscribe({
      next: (res) => {
        this.diets = res;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }
}
