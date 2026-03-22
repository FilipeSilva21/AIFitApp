import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { LucideAngularModule, Dumbbell, Calendar, Plus, Clock, ArrowRight } from 'lucide-angular';

@Component({
  selector: 'app-workout-list',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, DatePipe],
  template: `
    <div class="space-y-6">
      
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-white">My Workouts</h1>
          <p class="text-slate-400">All your AI-generated training programs.</p>
        </div>
        <a routerLink="/workouts/generate" class="btn-primary whitespace-nowrap">
          <lucide-icon name="plus" [size]="18" class="mr-2"></lucide-icon> Generate New
        </a>
      </div>

      <div *ngIf="isLoading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>

      <div *ngIf="!isLoading && workouts.length === 0" class="glass-card p-12 text-center border-dashed border-dark-border border-2">
        <div class="w-16 h-16 rounded-full bg-dark-bg/50 border border-dark-border text-slate-500 flex items-center justify-center mx-auto mb-4">
          <lucide-icon name="dumbbell" [size]="32"></lucide-icon>
        </div>
        <h3 class="text-xl font-bold text-white mb-2">No workouts yet</h3>
        <p class="text-slate-400 max-w-sm mx-auto mb-6">You haven't generated any training programs. Let our AI build the perfect custom plan for you.</p>
        <a routerLink="/workouts/generate" class="btn-primary">Get Started</a>
      </div>

      <div *ngIf="!isLoading && workouts.length > 0" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        
        <a *ngFor="let workout of workouts" [routerLink]="['/workouts', workout.id]" 
           class="glass-card p-6 border-transparent hover:border-primary/50 group block">
          
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-lg font-bold text-white group-hover:text-primary transition-colors line-clamp-1">{{ workout.name }}</h3>
          </div>
          
          <div class="space-y-3 mb-6">
            <div class="flex items-center text-sm text-slate-400">
              <lucide-icon name="calendar" [size]="16" class="mr-2"></lucide-icon>
              {{ workout.createdAt | date:'mediumDate' }}
            </div>
            
            <div class="flex items-center text-sm text-slate-400">
              <lucide-icon name="clock" [size]="16" class="mr-2"></lucide-icon>
              {{ workout.days?.length || 0 }} training days
            </div>
          </div>
          
          <div class="flex flex-wrap gap-2">
            <span *ngFor="let day of workout.days | slice:0:3" class="px-2 py-1 bg-dark-bg border border-dark-border rounded text-xs text-slate-300">
              {{ getDayName($any(day).dayOfWeek) | slice:0:3 }}
            </span>
            <span *ngIf="workout.days?.length > 3" class="px-2 py-1 bg-dark-bg border border-dark-border rounded text-xs text-slate-500">
              +{{ workout.days.length - 3 }}
            </span>
          </div>

          <div class="mt-6 pt-4 border-t border-dark-border flex justify-between items-center text-sm font-semibold text-slate-400 group-hover:text-primary transition-colors">
            View details
            <lucide-icon name="arrow-right" [size]="16" class="group-hover:translate-x-1 transition-transform"></lucide-icon>
          </div>
        </a>

      </div>
    </div>
  `
})
export class WorkoutListComponent implements OnInit {
  private http = inject(HttpClient);
  
  readonly icons = { Dumbbell, Calendar, Plus, Clock, ArrowRight };

  workouts: any[] = [];
  isLoading = true;

  ngOnInit() {
    this.http.get<any[]>(`${environment.apiUrl}/workout`).subscribe({
      next: (res) => {
        this.workouts = res;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  getDayName(dayEnum: number): string {
    const days = ['Sun', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days[dayEnum] || 'Unknown';
  }
}
