import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { LucideAngularModule, Activity, TrendingDown, Target, Plus, X, Trash2 } from 'lucide-angular';

@Component({
  selector: 'app-measurements',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, DatePipe],
  template: `
    <div class="space-y-6">
      
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-white">Body Measurements</h1>
          <p class="text-slate-400">Track your progress over time.</p>
        </div>
        <button (click)="isAdding = !isAdding" class="btn-primary whitespace-nowrap">
          <lucide-icon [name]="isAdding ? 'x' : 'plus'" [size]="18" class="mr-2"></lucide-icon> 
          {{ isAdding ? 'Cancel' : 'Add Missing' }}
        </button>
      </div>

      <!-- Add Form -->
      <div *ngIf="isAdding" class="glass-card p-6 border-primary/50 animate-slide-up">
        <h3 class="text-xl font-bold text-white mb-6">New Record</h3>
        <form [formGroup]="measureForm" (ngSubmit)="onSubmit()" class="space-y-6">
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label class="input-label">Date</label>
              <input type="date" formControlName="date" class="input-field" required>
            </div>
            <div>
              <label class="input-label">Weight (kg) *</label>
              <input type="number" step="0.1" formControlName="weight" class="input-field" required>
            </div>
            <div>
              <label class="input-label">Body Fat %</label>
              <input type="number" step="0.1" formControlName="bodyFatPercentage" class="input-field">
            </div>
          </div>

          <div class="pt-4 border-t border-dark-border">
            <h4 class="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">Circumferences (cm)</h4>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <label class="input-label">Chest</label>
                <input type="number" step="0.1" formControlName="chest" class="input-field px-3 py-2 text-sm">
              </div>
              <div>
                <label class="input-label">Waist</label>
                <input type="number" step="0.1" formControlName="waist" class="input-field px-3 py-2 text-sm">
              </div>
              <div>
                <label class="input-label">Hips</label>
                <input type="number" step="0.1" formControlName="hips" class="input-field px-3 py-2 text-sm">
              </div>
              <div>
                <label class="input-label">Left Arm</label>
                <input type="number" step="0.1" formControlName="leftArm" class="input-field px-3 py-2 text-sm">
              </div>
              <div>
                <label class="input-label">Right Arm</label>
                <input type="number" step="0.1" formControlName="rightArm" class="input-field px-3 py-2 text-sm">
              </div>
              <div>
                <label class="input-label">Right Thigh</label>
                <input type="number" step="0.1" formControlName="rightThigh" class="input-field px-3 py-2 text-sm">
              </div>
            </div>
          </div>

          <div class="pt-4 border-t border-dark-border">
            <label class="input-label">Notes</label>
            <input type="text" formControlName="notes" class="input-field" placeholder="e.g. Feeling sluggish today...">
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <button type="button" (click)="isAdding = false" class="btn-secondary">Cancel</button>
            <button type="submit" [disabled]="measureForm.invalid || isSaving" class="btn-primary">
              {{ isSaving ? 'Saving...' : 'Save Record' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Measurements List -->
      <div *ngIf="isLoading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>

      <div *ngIf="!isLoading && measurements.length === 0 && !isAdding" class="glass-card p-12 text-center border-dashed border-dark-border border-2">
        <div class="w-16 h-16 rounded-full bg-dark-bg/50 border border-dark-border text-slate-500 flex items-center justify-center mx-auto mb-4">
          <lucide-icon name="activity" [size]="32"></lucide-icon>
        </div>
        <h3 class="text-xl font-bold text-white mb-2">No data yet</h3>
        <p class="text-slate-400 max-w-sm mx-auto mb-6">Start tracking your weight and body measurements to see your progress over time.</p>
        <button (click)="isAdding = true" class="btn-primary">Add First Record</button>
      </div>

      <div *ngIf="!isLoading && measurements.length > 0" class="glass-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr class="bg-dark-bg/50 text-xs uppercase tracking-wider text-slate-500 border-b border-dark-border">
                <th class="p-4 font-semibold">Date</th>
                <th class="p-4 font-semibold">Weight</th>
                <th class="p-4 font-semibold">Body Fat</th>
                <th class="p-4 font-semibold">Chest</th>
                <th class="p-4 font-semibold">Waist</th>
                <th class="p-4 font-semibold">Arms (L/R)</th>
                <th class="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-dark-border/50">
              <tr *ngFor="let m of measurements" class="hover:bg-dark-card/50 transition-colors">
                <td class="p-4 font-medium text-slate-200">{{ m.date | date:'shortDate' }}</td>
                <td class="p-4">
                  <span class="font-bold text-white">{{ m.weight }}</span> <span class="text-xs text-slate-500">kg</span>
                </td>
                <td class="p-4 text-slate-300">{{ m.bodyFatPercentage ? m.bodyFatPercentage + '%' : '-' }}</td>
                <td class="p-4 text-slate-400">{{ m.chest || '-' }}</td>
                <td class="p-4 text-slate-400">{{ m.waist || '-' }}</td>
                <td class="p-4 text-slate-400">{{ m.leftArm || '-' }} / {{ m.rightArm || '-' }}</td>
                <td class="p-4 text-right">
                  <button (click)="deleteMeasurement(m.id)" class="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                    <lucide-icon name="trash-2" [size]="16"></lucide-icon>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class MeasurementsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  
  readonly icons = { Activity, TrendingDown, Target, Plus, X, Trash2 };

  measurements: any[] = [];
  isLoading = true;
  isAdding = false;
  isSaving = false;

  measureForm = this.fb.group({
    date: [new Date().toISOString().substring(0, 10), Validators.required],
    weight: [null as number | null, Validators.required],
    bodyFatPercentage: [null as number | null],
    chest: [null as number | null],
    waist: [null as number | null],
    hips: [null as number | null],
    leftArm: [null as number | null],
    rightArm: [null as number | null],
    leftThigh: [null as number | null],
    rightThigh: [null as number | null],
    notes: ['']
  });

  ngOnInit() {
    this.loadMeasurements();
  }

  loadMeasurements() {
    this.http.get<any[]>(`${environment.apiUrl}/measurement`).subscribe({
      next: (res) => {
        this.measurements = res;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  onSubmit() {
    if (this.measureForm.invalid) return;
    this.isSaving = true;

    this.http.post<any>(`${environment.apiUrl}/measurement`, this.measureForm.value).subscribe({
      next: (res) => {
        this.measurements.unshift(res);
        this.isAdding = false;
        this.isSaving = false;
        this.measureForm.reset({ date: new Date().toISOString().substring(0, 10) });
      },
      error: () => this.isSaving = false
    });
  }

  deleteMeasurement(id: number) {
    if (confirm('Delete this record?')) {
      this.http.delete(`${environment.apiUrl}/measurement/${id}`).subscribe(() => {
        this.measurements = this.measurements.filter(m => m.id !== id);
      });
    }
  }
}
