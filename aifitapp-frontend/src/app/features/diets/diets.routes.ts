import { Routes } from '@angular/router';
import { DietListComponent } from './diet-list/diet-list.component';
import { DietFormComponent } from './diet-form/diet-form.component';
import { DietDetailComponent } from './diet-detail/diet-detail.component';

export const DIET_ROUTES: Routes = [
  { path: '', component: DietListComponent },
  { path: 'generate', component: DietFormComponent },
  { path: ':id', component: DietDetailComponent }
];
