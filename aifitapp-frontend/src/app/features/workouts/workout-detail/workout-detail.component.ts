import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { LucideAngularModule, Dumbbell, Calendar, Clock, ChevronLeft } from 'lucide-angular';

@Component({
  selector: 'app-workout-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  template: `
    <div *ngIf="isLoading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <div *ngIf="workout && !isLoading" class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <a routerLink="/workouts" class="inline-flex items-center text-slate-400 hover:text-white transition-colors text-sm mb-4">
            <lucide-icon name="chevron-left" [size]="16" class="mr-1"></lucide-icon> Back to Workouts
          </a>
          <h1 class="text-3xl font-bold text-white flex items-center gap-3">
            {{ workout.name }}
            <span class="px-3 py-1 bg-primary/20 text-primary text-xs font-semibold rounded-full border border-primary/30">AI Generated</span>
          </h1>
          <p class="text-slate-400 mt-2 line-clamp-2 max-w-3xl">{{ workout.notes || 'Your customized training program.' }}</p>
        </div>
        
        <button (click)="deleteWorkout()" class="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/50 rounded-lg hover:bg-red-500/20 transition-colors text-sm font-medium">
          Delete Program
        </button>
      </div>

      <!-- Days Grid -->
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
        <div *ngFor="let day of workout.days" class="glass-card overflow-hidden flex flex-col">
          
          <div class="bg-gradient-to-r from-dark-card to-dark-bg p-5 border-b border-dark-border flex justify-between items-center">
            <div>
              <h3 class="text-xl font-bold text-white flex items-center gap-2">
                <lucide-icon name="calendar" [size]="20" class="text-primary"></lucide-icon>
                {{ getDayName(day.dayOfWeek) }}
              </h3>
              <p class="text-primary mt-1 font-medium">{{ day.muscleGroup || 'Full Body' }}</p>
            </div>
            
            <div class="text-right">
              <span class="inline-flex items-center text-xs font-medium px-2.5 py-1 bg-dark-bg rounded-md text-slate-400 border border-dark-border">
                <lucide-icon name="clock" [size]="12" class="mr-1.5"></lucide-icon>
                {{ formatDuration(day.duration) }}
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
                        {{ ex.sets }} Sets
                      </span>
                      <span class="px-2.5 py-1 bg-accent/10 text-accent border border-accent/20 rounded-md font-semibold">
                        {{ ex.reps }} Reps
                      </span>
                      <span *ngIf="ex.restSeconds" class="px-2.5 py-1 bg-slate-800 text-slate-300 border border-slate-700 rounded-md">
                        {{ ex.restSeconds }}s Rest
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
  
  readonly icons = { Dumbbell, Calendar, Clock, ChevronLeft };

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

  getDayName(dayEnum: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    // enum: Monday=1...Sunday=7
    return days[dayEnum] || 'Unknown';
  }

  formatDuration(duration: number): string {
    if (duration === 40) return '40 Min';
    if (duration === 60) return '1 Hour';
    if (duration === 90) return '1.5 Hours';
    if (duration === 0) return 'Unlimited';
    return duration + ' Min';
  }
}
