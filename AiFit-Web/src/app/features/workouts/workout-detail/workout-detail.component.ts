import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { LanguageService } from '../../../core/services/language.service';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-workout-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, TranslatePipe],
  template: `
    <div *ngIf="isLoading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <div *ngIf="workout && !isLoading" class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <a routerLink="/workouts" class="inline-flex items-center text-slate-400 hover:text-white transition-colors text-sm mb-4">
            <lucide-icon name="chevron-left" [size]="16" class="mr-1"></lucide-icon> {{ 'Voltar aos Treinos' | trans }}
          </a>
          <h1 class="text-3xl font-bold text-white flex items-center gap-3">
            {{ workout.name }}
            <span class="px-3 py-1 bg-primary/20 text-primary text-xs font-semibold rounded-full border border-primary/30">{{ 'AI Generated' | trans }}</span>
          </h1>
          <p class="text-slate-400 mt-2 line-clamp-2 max-w-3xl">{{ (workout.notes || 'Seu programa de treino personalizado.') | trans }}</p>
        </div>
        
        <button (click)="deleteWorkout()" class="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/50 rounded-lg hover:bg-red-500/20 transition-colors text-sm font-medium">
          {{ 'Excluir Programa' | trans }}
        </button>
      </div>

      <!-- Days Grid -->
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
        <div *ngFor="let day of workout.days" class="glass-card overflow-hidden flex flex-col">
          
          <div class="bg-gradient-to-r from-dark-card to-dark-bg p-5 border-b border-dark-border flex justify-between items-center">
            <div>
              <h3 class="text-xl font-bold text-white flex items-center gap-2">
                <lucide-icon name="calendar" [size]="20" class="text-primary"></lucide-icon>
                {{ getDayName(day.dayOfWeek) | trans }}
              </h3>
              <p class="text-primary mt-1 font-medium">{{ (day.muscleGroup || 'Corpo Inteiro') | trans }}</p>
            </div>
            
            <div class="text-right">
              <span class="inline-flex items-center text-xs font-medium px-2.5 py-1 bg-dark-bg rounded-md text-slate-400 border border-dark-border">
                <lucide-icon name="clock" [size]="12" class="mr-1.5"></lucide-icon>
                {{ formatDuration(day.duration) | trans }}
              </span>
            </div>
          </div>

          <div class="p-0 flex-1 bg-dark-bg/20">
            <ul class="divide-y divide-dark-border">
              <li *ngFor="let ex of day.exercises; let i = index" class="p-4 hover:bg-dark-card/30 transition-colors">
                <div class="flex items-start gap-4">
                  <div class="flex-shrink-0 w-8 h-8 rounded-full bg-dark-bg border border-dark-border flex items-center justify-center text-sm font-bold text-slate-400">
                    {{ i + 1 }}
                  </div>
                  
                  <div class="flex-1 min-w-0">
                    <h4 class="text-base font-bold text-slate-200 truncate">{{ ex.name }}</h4>
                    
                    <div class="mt-2 flex flex-wrap gap-2 text-sm">
                      <span class="px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 rounded-md font-semibold">
                        {{ ex.sets }} {{ 'Séries' | trans }}
                      </span>
                      <span class="px-2.5 py-1 bg-accent/10 text-accent border border-accent/20 rounded-md font-semibold">
                        {{ ex.reps }} {{ 'Repetições' | trans }}
                      </span>
                      <span *ngIf="ex.restSeconds" class="px-2.5 py-1 bg-slate-800 text-slate-300 border border-slate-700 rounded-md">
                        {{ ex.restSeconds }}s {{ 'Descanso' | trans }}
                      </span>
                    </div>

                    <p *ngIf="ex.notes" class="mt-3 text-sm text-slate-400 italic border-l-2 border-slate-700 pl-3">
                      {{ ex.notes }}
                    </p>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
    </div>
  `
})
export class WorkoutDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  
  public langService = inject(LanguageService);


  workout: any = null;
  isLoading = true;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.http.get<any>(`${environment.apiUrl}/workout/${id}`).subscribe({
        next: (res) => {
          this.workout = res;
          this.isLoading = false;
        },
        error: () => {
          this.router.navigate(['/dashboard']);
        }
      });
    }
  }

  deleteWorkout() {
    if (confirm('Are you sure you want to delete this workout?')) {
      this.http.delete(`${environment.apiUrl}/workout/${this.workout.id}`).subscribe(() => {
        this.router.navigate(['/workouts']);
      });
    }
  }

  getDayName(dayEnum: any): string {
    if (typeof dayEnum === 'string') {
        const map: any = {
          'Monday': 'Segunda-feira',
          'Tuesday': 'Terça-feira',
          'Wednesday': 'Quarta-feira',
          'Thursday': 'Quinta-feira',
          'Friday': 'Sexta-feira',
          'Saturday': 'Sábado',
          'Sunday': 'Domingo'
        };
        return map[dayEnum] || dayEnum;
    }
    const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];
    return days[dayEnum] || 'Desconhecido';
  }

  formatDuration(duration: number): string {
    if (duration === 40) return '40 ' + 'Minutos';
    if (duration === 60) return '1 ' + 'Hora';
    if (duration === 90) return '1.5 ' + 'Horas';
    if (duration === 0) return 'Sem limite';
    return duration + ' ' + 'Minutos';
  }
}
