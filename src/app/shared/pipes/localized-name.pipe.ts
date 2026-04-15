import { inject, Pipe, PipeTransform } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

@Pipe({ name: 'localizedName', standalone: true, pure: false })
export class LocalizedNamePipe implements PipeTransform {
  private t = inject(TranslocoService);

  transform(name: Record<string, string> | null | undefined): string {
    if (!name) return '—';
    const lang = this.t.getActiveLang();
    return name[lang] || name['en'] || '—';
  }
}
