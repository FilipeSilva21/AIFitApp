import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { LanguageService } from '../../../core/services/language.service';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-diet-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, TranslatePipe],
  template: `
    <div *ngIf="isLoading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
    </div>

    <div *ngIf="diet && !isLoading" class="space-y-6">
      
      <!-- Top header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <a routerLink="/diets" class="inline-flex items-center text-slate-400 hover:text-white transition-colors text-sm mb-4">
            <lucide-icon name="chevron-left" [size]="16" class="mr-1"></lucide-icon> {{ 'Voltar às Dietas' | trans }}
          </a>
          <h1 class="text-3xl font-bold text-white flex items-center gap-3">
            {{ diet.name }}
            <span class="px-3 py-1 bg-accent/20 text-accent text-xs font-semibold rounded-full border border-accent/30">{{ 'AI Generated' | trans }}</span>
          </h1>
          <p class="text-slate-400 mt-2 line-clamp-2 max-w-3xl">{{ (diet.notes || 'Sua estratégia nutricional personalizada.') | trans }}</p>
        </div>
        
        <div class="flex items-center gap-4">
          <div class="px-6 py-3 glass-card flex flex-col items-center justify-center border-accent/30">
            <span class="text-xs text-slate-400 font-semibold mb-1 uppercase tracking-wider">{{ 'Total Diário' | trans }}</span>
            <div class="flex items-center gap-2 text-2xl font-bold text-white">
              <lucide-icon name="flame" [size]="24" class="text-accent"></lucide-icon>
              {{ diet.totalCalories || calculateTotalCalories() }} kcal
            </div>
          </div>
          <button (click)="deleteDiet()" class="p-3 bg-red-500/10 text-red-500 border border-red-500/50 rounded-xl hover:bg-red-500/20 transition-colors">
            <lucide-icon name="trash" [size]="20"></lucide-icon>
          </button>
        </div>
      </div>

      <!-- Macros Summary -->
      <div class="grid grid-cols-3 gap-4 lg:hidden mt-6">
        <div class="glass-card p-4 text-center border-b-4 border-b-blue-500">
          <span class="text-sm text-slate-400">{{ 'Proteína' | trans }}</span>
          <div class="text-xl font-bold text-white">{{ calculateTotalMacro('protein') }}g</div>
        </div>
        <div class="glass-card p-4 text-center border-b-4 border-b-emerald-500">
          <span class="text-sm text-slate-400">{{ 'Carboidratos' | trans }}</span>
          <div class="text-xl font-bold text-white">{{ calculateTotalMacro('carbs') }}g</div>
        </div>
        <div class="glass-card p-4 text-center border-b-4 border-b-amber-500">
          <span class="text-sm text-slate-400">{{ 'Gordura' | trans }}</span>
          <div class="text-xl font-bold text-white">{{ calculateTotalMacro('fat') }}g</div>
        </div>
      </div>

      <!-- Meal Cards -->
      <div class="mt-8 space-y-6 lg:w-3/4 mx-auto">
        <div *ngFor="let meal of diet.meals; let i = index" class="glass-card overflow-hidden">
          
          <div class="bg-dark-card p-5 border-b border-dark-border flex justify-between items-center relative overflow-hidden">
            <div class="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-accent/10 to-transparent"></div>
            <div class="relative z-10 flex items-center gap-4">
              <div class="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-bold text-lg shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                {{ i + 1 }}
              </div>
              <div>
                <h3 class="text-xl font-bold text-white">{{ meal.name }}</h3>
                <div class="flex items-center text-sm text-slate-400 mt-1" *ngIf="meal.time">
                  <lucide-icon name="clock" [size]="14" class="mr-1.5"></lucide-icon> {{ meal.time }}
                </div>
              </div>
            </div>
            
            <div class="text-right flex items-end flex-col gap-1 relative z-10 hidden sm:flex">
              <span class="text-xs text-slate-500 font-semibold uppercase tracking-wider">{{ 'Estimado' | trans }}</span>
              <span class="text-lg font-bold text-white">{{ getMealCalories(meal) }} kcal</span>
            </div>
          </div>

          <div class="p-0 bg-dark-bg/30">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-dark-bg text-xs uppercase tracking-wider text-slate-500 border-b border-dark-border">
                  <th class="p-4 font-semibold">{{ 'Alimento' | trans }}</th>
                  <th class="p-4 font-semibold w-24">{{ 'Qtd' | trans }}</th>
                  <th class="p-4 font-semibold text-right w-20">Kcal</th>
                  <th class="p-4 font-semibold text-right w-16 hidden sm:table-cell text-blue-400/80">P</th>
                  <th class="p-4 font-semibold text-right w-16 hidden sm:table-cell text-emerald-400/80">C</th>
                  <th class="p-4 font-semibold text-right w-16 hidden sm:table-cell text-amber-400/80">F</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-dark-border/50">
                <tr *ngFor="let food of meal.foods" class="hover:bg-dark-card/50 transition-colors">
                  <td class="p-4">
                    <div class="font-medium text-slate-200">{{ food.name }}</div>
                  </td>
                  <td class="p-4 text-slate-400">{{ food.quantity || '-' }}</td>
                  <td class="p-4 font-medium text-white text-right">{{ food.calories || '-' }}</td>
                  <td class="p-4 text-sm text-slate-400 text-right hidden sm:table-cell">{{ food.protein || 0 }}g</td>
                  <td class="p-4 text-sm text-slate-400 text-right hidden sm:table-cell">{{ food.carbs || 0 }}g</td>
                  <td class="p-4 text-sm text-slate-400 text-right hidden sm:table-cell">{{ food.fat || 0 }}g</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
    </div>
  `
})
export class DietDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  
  public langService = inject(LanguageService);


  diet: any = null;
  isLoading = true;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.http.get<any>(`${environment.apiUrl}/diet/${id}`).subscribe({
        next: (res) => {
          this.diet = res;
          this.isLoading = false;
        },
        error: () => {
          this.router.navigate(['/dashboard']);
        }
      });
    }
  }

  deleteDiet() {
    if (confirm(this.langService.translate('Tem certeza que deseja excluir este plano alimentar?'))) {
      this.http.delete(`${environment.apiUrl}/diet/${this.diet.id}`).subscribe(() => {
        this.router.navigate(['/diets']);
      });
    }
  }

  getMealCalories(meal: any): number {
    if (!meal.foods || !Array.isArray(meal.foods)) return 0;
    return meal.foods.reduce((sum: number, food: any) => sum + (food.calories || 0), 0);
  }

  calculateTotalCalories(): number {
    if (!this.diet || !this.diet.meals) return 0;
    return this.diet.meals.reduce((sum: number, meal: any) => sum + this.getMealCalories(meal), 0);
  }

  calculateTotalMacro(macro: 'protein' | 'carbs' | 'fat'): number {
    if (!this.diet || !this.diet.meals) return 0;
    let total = 0;
    this.diet.meals.forEach((meal: any) => {
      if (meal.foods) {
        meal.foods.forEach((food: any) => {
          total += (food[macro] || 0);
        });
      }
    });
    return Math.round(total);
  }
}
