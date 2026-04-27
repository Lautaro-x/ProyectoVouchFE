import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoService } from '@jsverse/transloco';
import { ACCEPT_LANGUAGE } from '../tokens/accept-language.token';
import { ACTIVE_LANGS } from '../constants/langs';

@Injectable({ providedIn: 'root' })
export class LangService {
  private readonly translocoService = inject(TranslocoService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly acceptLanguage = inject(ACCEPT_LANGUAGE);

  private readonly STORAGE_KEY = 'lang';
  private readonly AVAILABLE: string[] = [...ACTIVE_LANGS];
  private readonly DEFAULT = 'en';

  readonly activeLang = toSignal(this.translocoService.langChanges$, {
    initialValue: this.translocoService.getActiveLang(),
  });

  get availableLangs(): string[] {
    return this.translocoService.getAvailableLangs() as string[];
  }

  init(): void {
    this.translocoService.setActiveLang(this.detect());
  }

  setLang(lang: string): void {
    this.translocoService.setActiveLang(lang);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.STORAGE_KEY, lang);
    }
  }

  private detect(): string {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved && this.AVAILABLE.includes(saved)) return saved;
      return this.parseNavigatorLang() ?? this.DEFAULT;
    }

    return this.parseAcceptLanguage() ?? this.DEFAULT;
  }

  private parseNavigatorLang(): string | null {
    const base = navigator.language?.split('-')[0].toLowerCase();
    return this.AVAILABLE.includes(base) ? base : null;
  }

  private parseAcceptLanguage(): string | null {
    if (!this.acceptLanguage) return null;

    const match = this.acceptLanguage
      .split(',')
      .map(l => l.split(';')[0].trim().split('-')[0].toLowerCase())
      .find(l => this.AVAILABLE.includes(l));

    return match ?? null;
  }
}
