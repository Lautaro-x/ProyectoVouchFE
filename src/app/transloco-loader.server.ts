import { Injectable } from '@angular/core';
import { Translation, TranslocoLoader } from '@jsverse/transloco';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Observable, of } from 'rxjs';

@Injectable()
export class TranslocoFsLoader implements TranslocoLoader {
  getTranslation(lang: string): Observable<Translation> {
    const serverDir = dirname(fileURLToPath(import.meta.url));
    const path = join(serverDir, '../browser/i18n/', `${lang}.json`);
    try {
      return of(JSON.parse(readFileSync(path, 'utf-8')));
    } catch {
      return of({});
    }
  }
}
