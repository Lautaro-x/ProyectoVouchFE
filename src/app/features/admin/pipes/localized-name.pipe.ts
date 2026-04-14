import { inject, Pipe, PipeTransform } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { TranslatableName } from '../models/admin.models';

@Pipe({ name: 'localizedName', standalone: true, pure: false })
export class LocalizedNamePipe implements PipeTransform {
  private t = inject(TranslocoService);

  transform(name: TranslatableName | null | undefined): string {
    if (!name) return '—';
    const lang = this.t.getActiveLang();
    return name[lang] || name['en'] || '—';
  }
}
