import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-workout-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-4xl mx-auto">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-white mb-2">Create New Workout</h1>
        <p class="text-slate-400">Let AI tailor the perfect training program for your specific goals.</p>
      </div>

      <div class="glass-card p-6 md:p-8">
        <form [formGroup]="workoutForm" (ngSubmit)="onSubmit()" class="space-y-8">
          
          <div *ngIf="error" class="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-sm">
            {{ error }}
          </div>

          <!-- Section 1: Goal & Experience -->
          <div>
            <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span class="flex items-center justify-center w-6 h-6 rounded bg-primary/20 text-primary text-xs">1</span>
              Goal & Experience
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="input-label">Primary Goal</label>
                <select formControlName="goal" class="input-field cursor-pointer">
                  <option [value]="1">Hypertrophy (Muscle Gain)</option>
                  <option [value]="2">Weight Loss / Fat Burning</option>
                  <option [value]="3">Strength Building</option>
                  <option [value]="4">Endurance</option>
                  <option [value]="5">General Fitness</option>
                </select>
              </div>
              <div>
                <label class="input-label">Training Experience</label>
                <select formControlName="trainingExperience" class="input-field cursor-pointer">
                  <option value="Beginner (0-6 months)">Beginner (0-6 months)</option>
                  <option value="Intermediate (6-24 months)">Intermediate (6-24 months)</option>
                  <option value="Advanced (2+ years)">Advanced (2+ years)</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Section 2: Availability -->
          <div class="pt-6 border-t border-dark-border/50">
            <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span class="flex items-center justify-center w-6 h-6 rounded bg-accent/20 text-accent text-xs">2</span>
              Schedule
            </h3>
            
            <div class="space-y-6">
              <div>
                <label class="input-label mb-3">Available Days</label>
                <div class="flex flex-wrap gap-3">
                  <ng-container *ngFor="let day of days; let i = index">
                    <label class="cursor-pointer relative">
                      <input type="checkbox" [value]="day.id" (change)="onDayChange($event)" class="peer sr-only">
                      <div class="px-4 py-2 rounded-lg border border-dark-border bg-dark-bg/50 text-slate-300 font-medium transition-all peer-checked:bg-primary/20 peer-checked:border-primary peer-checked:text-primary hover:bg-slate-800">
                        {{ day.name }}
                      </div>
                    </label>
                  </ng-container>
                </div>
                <div *ngIf="workoutForm.get('availableDays')?.touched && workoutForm.get('availableDays')?.hasError('required')" class="text-xs text-red-500 mt-2 ml-1">
                  Please select at least one day
                </div>
              </div>

              <div>
                <label class="input-label">Session Duration</label>
                <select formControlName="duration" class="input-field cursor-pointer max-w-xs">
                  <option [value]="40">40 Minutes</option>
                  <option [value]="60">1 Hour</option>
                  <option [value]="90">1.5 Hours</option>
                  <option [value]="0">Unlimited</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Section 3: Details -->
          <div class="pt-6 border-t border-dark-border/50">
            <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span class="flex items-center justify-center w-6 h-6 rounded bg-emerald-500/20 text-emerald-400 text-xs">3</span>
              Specifics
            </h3>
            
            <div class="space-y-6">
              <div>
                <label class="input-label">Previous Injuries / Limitations (Optional)</label>
                <textarea formControlName="injuries" rows="2" class="input-field resize-none" placeholder="e.g. Bad lower back, shoulder pain..."></textarea>
              </div>
              
              <div>
                <label class="input-label">Additional Notes (Optional)</label>
                <textarea formControlName="additionalNotes" rows="2" class="input-field resize-none" placeholder="e.g. Include cardio, I only have dumbbells..."></textarea>
              </div>
            </div>
          </div>

          <div class="pt-8 flex justify-end">
            <button type="submit" [disabled]="workoutForm.invalid || isLoading || selectedDays.length === 0" class="btn-primary min-w-[200px]">
              <span *ngIf="isLoading" class="animate-pulse flex items-center gap-2">
                <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Processing AI...
              </span>
              <span *ngIf="!isLoading">Generate Workout</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class WorkoutFormComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);

  days = [
    { id: 1, name: 'Monday' },
    { id: 2, name: 'Tuesday' },
    { id: 3, name: 'Wednesday' },
    { id: 4, name: 'Thursday' },
    { id: 5, name: 'Friday' },
    { id: 6, name: 'Saturday' },
    { id: 7, name: 'Sunday' }
  ];

  selectedDays: number[] = [];

  workoutForm = this.fb.group({
    goal: [1, Validators.required], // 1=Hypertrophy
    trainingExperience: ['Beginner (0-6 months)', Validators.required],
    injuries: [''],
    availableDays: [[], Validators.required],
    duration: [60, Validators.required], // 60=1 Hour
    additionalNotes: ['']
  });

  isLoading = false;
  error = '';

  onDayChange(event: any) {
    const value = parseInt(event.target.value);
    if (event.target.checked) {
      this.selectedDays.push(value);
    } else {
      this.selectedDays = this.selectedDays.filter(d => d !== value);
    }
    
    // Sort days chronologically
    this.selectedDays.sort((a, b) => a - b);
    this.workoutForm.patchValue({ availableDays: this.selectedDays as any });
  }

  onSubmit() {
    if (this.workoutForm.invalid || this.selectedDays.length === 0) {
      this.workoutForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.error = '';

    const payload = {
      ...this.workoutForm.value,
      goal: Number(this.workoutForm.value.goal),
      duration: Number(this.workoutForm.value.duration)
    };

    this.http.post<any>(`${environment.apiUrl}/workout/generate`, payload)
      .subscribe({
        next: (workout) => {
          this.router.navigate(['/workouts', workout.id]);
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to generate workout. Make sure your API key is valid.';
          this.isLoading = false;
        }
      });
  }
}
