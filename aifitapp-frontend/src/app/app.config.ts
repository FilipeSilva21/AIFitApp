import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { LucideAngularModule, Dumbbell, Utensils, Activity, User, LogOut, Settings2, Menu, X, Calendar, Plus, Clock, ArrowRight, TrendingDown, TrendingUp, Target, Trash2, Zap, Save, CheckCircle, ChevronLeft, Flame, DollarSign } from 'lucide-angular';

import { routes } from './app.routes';
import { authInterceptor } from './core/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    importProvidersFrom(LucideAngularModule.pick({ Dumbbell, Utensils, Activity, User, LogOut, Settings2, Menu, X, Calendar, Plus, Clock, ArrowRight, TrendingDown, TrendingUp, Target, Trash2, Zap, Save, CheckCircle, ChevronLeft, Flame, DollarSign }))
  ]
};
