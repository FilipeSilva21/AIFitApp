import { Pipe, PipeTransform, inject } from '@angular/core';
import { LanguageService } from '../services/language.service';

@Pipe({
  name: 'trans',
  standalone: true,
  // We make it impure strictly so it re-renders immediately when the Language Service signal changes
  pure: false
})
export class TranslatePipe implements PipeTransform {
  private langService = inject(LanguageService);

  transform(value: string): string {
    if (!value) return '';
    return this.langService.translate(value);
  }
}
