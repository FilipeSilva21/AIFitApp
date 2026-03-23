import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { LanguageService } from '../../core/services/language.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { LucideAngularModule, Dumbbell, Utensils, Activity, User, LogOut, Settings2, Menu, X } from 'lucide-angular';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule, TranslatePipe],
  template: `
    <div class="min-h-screen flex bg-dark-bg">
      
      <!-- Mobile sidebar backdrop -->
      <div *ngIf="sidebarOpen" class="fixed inset-0 z-40 bg-dark-bg/80 backdrop-blur-sm lg:hidden" (click)="sidebarOpen = false"></div>

      <!-- Sidebar -->
      <aside [class.translate-x-0]="sidebarOpen" [class.-translate-x-full]="!sidebarOpen"
        class="fixed inset-y-0 left-0 z-50 w-64 glass-card border-none rounded-none border-r border-dark-border flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:w-64">
        
        <div class="h-16 flex items-center px-6 border-b border-dark-border/50 justify-between lg:justify-center">
          <a routerLink="/dashboard" class="flex items-center gap-2">
            <div class="p-1.5 bg-primary/20 rounded-lg text-primary">
              <lucide-icon name="dumbbell" [size]="20"></lucide-icon>
            </div>
            <span class="text-xl font-bold tracking-tight text-white">AIFit<span class="text-primary">.</span></span>
          </a>
            <button class="lg:hidden text-slate-400" (click)="sidebarOpen = false">
            <lucide-icon name="x" [size]="24"></lucide-icon>
          </button>
        </div>

        <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <a routerLink="/dashboard" routerLinkActive="bg-dark-border/50 text-white" [routerLinkActiveOptions]="{exact: true}"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-slate-400 hover:text-slate-200 hover:bg-dark-border/30 transition-colors">
            <lucide-icon name="activity" [size]="18"></lucide-icon>
            {{ 'Painel' | trans }}
          </a>
          
          <div class="pt-4 pb-2">
            <p class="px-3 text-xs font-semibold tracking-wider text-slate-500 uppercase">{{ 'Geração por I.A.' | trans }}</p>
          </div>
          
          <a routerLink="/workouts" routerLinkActive="bg-primary/10 text-primary"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-slate-400 hover:text-slate-200 hover:bg-dark-border/30 transition-colors">
            <lucide-icon name="dumbbell" [size]="18"></lucide-icon>
            {{ 'Treinos' | trans }}
          </a>
          
          <a routerLink="/diets" routerLinkActive="bg-primary/10 text-primary"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-slate-400 hover:text-slate-200 hover:bg-dark-border/30 transition-colors">
            <lucide-icon name="utensils" [size]="18"></lucide-icon>
            {{ 'Dietas' | trans }}
          </a>
          
          <div class="pt-4 pb-2">
            <p class="px-3 text-xs font-semibold tracking-wider text-slate-500 uppercase">{{ 'Acompanhamento' | trans }}</p>
          </div>
          
          <a routerLink="/measurements" routerLinkActive="bg-dark-border/50 text-white"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-slate-400 hover:text-slate-200 hover:bg-dark-border/30 transition-colors">
            <lucide-icon name="activity" [size]="18"></lucide-icon>
            {{ 'Medições' | trans }}
          </a>
        </nav>

        <div class="p-4 border-t border-dark-border/50">
          <a routerLink="/profile" routerLinkActive="bg-dark-border/50 text-white"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-dark-border/30 mb-2">
            <lucide-icon name="settings-2" [size]="18"></lucide-icon>
            {{ 'Perfil & Configurações' | trans }}
          </a>
          <button (click)="logout()" class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors">
            <lucide-icon name="log-out" [size]="18"></lucide-icon>
            {{ 'Sair' | trans }}
          </button>
        </div>
      </aside>

      <!-- Main content -->
      <main class="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-dark-bg to-dark-bg pointer-events-none"></div>
        
        <!-- Mobile header -->
        <header class="h-16 flex items-center justify-between px-4 sm:px-6 lg:hidden border-b border-dark-border/50 relative z-10">
          <button class="text-slate-400 hover:text-white" (click)="sidebarOpen = true">
            <lucide-icon name="menu" [size]="24"></lucide-icon>
          </button>
          <div class="text-lg font-bold text-white">AIFit</div>
          <div class="w-6"></div> <!-- spacer -->
        </header>

        <div class="flex-1 overflow-y-auto relative z-10 p-4 sm:p-6 lg:p-8">
          <div class="max-w-6xl mx-auto animate-fade-in">
            <router-outlet></router-outlet>
          </div>
        </div>
      </main>
    </div>
  `
})
export class DashboardLayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  public langService = inject(LanguageService);

  // Register icons used in the layout
  readonly icons = { Dumbbell, Utensils, Activity, User, LogOut, Settings2, Menu, X };

  sidebarOpen = false;

  logout() {
    this.authService.clearToken();
    this.router.navigate(['/login']);
  }
}
