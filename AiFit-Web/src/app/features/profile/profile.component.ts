import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { LucideAngularModule, User, Settings2, Zap, Save, CheckCircle } from 'lucide-angular';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  template: `
    <div class="max-w-4xl mx-auto space-y-6">
      
      <div>
        <h1 class="text-3xl font-bold text-white">Profile & Settings</h1>
        <p class="text-slate-400">Manage your personal information and AI configuration.</p>
      </div>

      <!-- AI Settings Card -->
      <div class="glass-card overflow-hidden">
        <div class="bg-dark-card p-6 border-b border-dark-border flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-accent/20 text-accent rounded-lg">
              <lucide-icon name="zap" [size]="20"></lucide-icon>
            </div>
            <h2 class="text-lg font-bold text-white">AI Configuration</h2>
          </div>
          <span *ngIf="aiConfigured" class="flex items-center text-emerald-400 text-sm font-semibold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <lucide-icon name="check-circle" [size]="14" class="mr-1"></lucide-icon> Connected
          </span>
        </div>
        
        <div class="p-6">
          <div *ngIf="aiConfigured" class="flex items-center justify-between p-4 border border-dark-border rounded-xl bg-dark-bg/50">
            <div>
              <h4 class="font-semibold text-white">Active Provider: {{ aiProvider === 1 ? 'OpenAI' : 'Google Gemini' }}</h4>
              <p class="text-sm text-slate-400">Your API key is securely stored and used for generating content.</p>
            </div>
            <button (click)="disconnectAI()" class="btn-secondary text-red-400 hover:text-red-300 hover:border-red-500/50">
              Disconnect
            </button>
          </div>

          <div *ngIf="!aiConfigured" class="text-center py-6">
            <p class="text-slate-400 mb-4">You need to connect an AI provider to generate workouts and diets.</p>
            <a href="/ai-setup" class="btn-primary !bg-accent hover:!bg-accent-hover shadow-[0_4px_14px_0_rgba(139,92,246,0.39)]">Configure AI Now</a>
          </div>
        </div>
      </div>

      <!-- Profile Settings Card -->
      <div class="glass-card overflow-hidden">
        <div class="bg-dark-card p-6 border-b border-dark-border flex items-center gap-3">
          <div class="p-2 bg-primary/20 text-primary rounded-lg">
            <lucide-icon name="user" [size]="20"></lucide-icon>
          </div>
          <h2 class="text-lg font-bold text-white">Personal Information</h2>
        </div>
        
        <div class="p-6">
          <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="space-y-6">
            
            <div *ngIf="saveSuccess" class="p-4 bg-emerald-500/10 border border-emerald-500/50 rounded-xl text-emerald-400 text-sm flex items-center">
              <lucide-icon name="check-circle" [size]="18" class="mr-2"></lucide-icon> Profile updated successfully!
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="input-label">Age</label>
                <input type="number" formControlName="age" class="input-field">
              </div>
              
              <div>
                <label class="input-label">Primary Goal</label>
                <select formControlName="goal" class="input-field cursor-pointer">
                  <option [value]="1">Hypertrophy (Muscle Gain)</option>
                  <option [value]="2">Weight Loss / Fat Loss</option>
                  <option [value]="3">Strength / Performance</option>
                  <option [value]="4">Endurance</option>
                  <option [value]="5">General Fitness</option>
                </select>
              </div>

              <div>
                <label class="input-label">Current Weight (kg)</label>
                <input type="number" step="0.1" formControlName="weight" class="input-field">
              </div>

              <div>
                <label class="input-label">Height (cm)</label>
                <input type="number" formControlName="height" class="input-field">
              </div>
            </div>

            <div class="space-y-6">
              <div>
                <label class="input-label">Training Experience</label>
                <select formControlName="trainingExperience" class="input-field cursor-pointer">
                  <option value="Beginner (0-6 months)">Beginner (0-6 months)</option>
                  <option value="Intermediate (6-24 months)">Intermediate (6-24 months)</option>
                  <option value="Advanced (2+ years)">Advanced (2+ years)</option>
                </select>
              </div>

              <div>
                <label class="input-label">Known Injuries or Physical Limitations</label>
                <textarea formControlName="injuries" rows="3" class="input-field resize-none" placeholder="These will be taken into account when generating workouts."></textarea>
              </div>
            </div>

            <div class="pt-4 flex justify-end">
              <button type="submit" [disabled]="profileForm.invalid || isSaving" class="btn-primary min-w-[150px]">
                <span *ngIf="isSaving" class="animate-pulse">Saving...</span>
                <span *ngIf="!isSaving" class="flex items-center"><lucide-icon name="save" [size]="18" class="mr-2"></lucide-icon> Save Changes</span>
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
  
  readonly icons = { User, Settings2, Zap, Save, CheckCircle };

  profileForm = this.fb.group({
    age: [null as number | null],
    weight: [null as number | null],
    height: [null as number | null],
    goal: [5, Validators.required],
    trainingExperience: ['Beginner (0-6 months)'],
    injuries: ['']
  });

  aiConfigured = false;
  aiProvider: number | null = null;
  isSaving = false;
  saveSuccess = false;

  ngOnInit() {
    this.loadProfile();
    this.loadAiStatus();
  }

  loadAiStatus() {
    this.http.get<any>(`${environment.apiUrl}/aisettings/status`).subscribe(res => {
      this.aiConfigured = res.isConfigured;
      this.aiProvider = res.provider;
    });
  }

  loadProfile() {
    this.http.get<any>(`${environment.apiUrl}/profile`).subscribe(res => {
      if (res) {
        this.profileForm.patchValue({
          age: res.age,
          weight: res.weight,
          height: res.height,
          goal: res.goal || 5,
          trainingExperience: res.trainingExperience || 'Beginner (0-6 months)',
          injuries: res.injuries
        });
      }
    });
  }

  saveProfile() {
    if (this.profileForm.invalid) return;
    
    this.isSaving = true;
    this.saveSuccess = false;

    const payload = {
      ...this.profileForm.value,
      goal: Number(this.profileForm.value.goal)
    };

    this.http.put(`${environment.apiUrl}/profile`, payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.saveSuccess = true;
        setTimeout(() => this.saveSuccess = false, 3000);
      },
      error: () => this.isSaving = false
    });
  }

  disconnectAI() {
    if (confirm('Are you sure you want to disconnect your AI provider? You will not be able to generate new workouts or diets.')) {
      this.http.delete(`${environment.apiUrl}/aisettings/disconnect`).subscribe(() => {
        this.aiConfigured = false;
        this.aiProvider = null;
      });
    }
  }
}
