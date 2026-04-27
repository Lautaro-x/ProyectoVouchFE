import { Component, inject, signal, computed, HostListener, ElementRef, ChangeDetectionStrategy,
} from '@angular/core';
import { LangService } from '../../../core/services/lang.service';
import { ACTIVE_LANGS } from '../../../core/constants/langs';

interface LangOption {
  code: string;
  country: string;
}

@Component({
  selector: 'app-lang-switcher',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  templateUrl: './lang-switcher.component.html',
  styleUrl: './lang-switcher.component.css',
})
export class LangSwitcherComponent {
  protected readonly langService = inject(LangService);
  private readonly elementRef = inject(ElementRef);

  readonly isOpen = signal(false);

  private readonly allLangOptions: LangOption[] = [
    { code: 'es', country: 'es' },
    { code: 'en', country: 'gb' },
    { code: 'fr', country: 'fr' },
    { code: 'pt', country: 'pt' },
    { code: 'it', country: 'it' },
  ];

  readonly langOptions = this.allLangOptions.filter(o =>
    (ACTIVE_LANGS as readonly string[]).includes(o.code)
  );

  readonly currentCountry = computed(
    () => this.langOptions.find(o => o.code === this.langService.activeLang())?.country ?? 'es'
  );

  toggle(): void {
    this.isOpen.update(v => !v);
  }

  selectLang(code: string): void {
    this.langService.setLang(code);
    this.isOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }
}
