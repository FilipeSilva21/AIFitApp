import { Routes } from '@angular/router';
import { WorkoutListComponent } from './workout-list/workout-list.component';
import { WorkoutFormComponent } from './workout-form/workout-form.component';
import { WorkoutDetailComponent } from './workout-detail/workout-detail.component';

export const WORKOUT_ROUTES: Routes = [
  { path: '', component: WorkoutListComponent },
  { path: 'generate', component: WorkoutFormComponent },
  { path: ':id', component: WorkoutDetailComponent }
];
