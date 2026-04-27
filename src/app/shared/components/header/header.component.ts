import { Component, HostListener, inject, signal, ChangeDetectionStrategy,
} from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';
import { Genre } from '../../../core/models/product.model';
import { ActiveAnnouncement, ActiveSurvey } from '../../../core/models/user.model';
import { LangSwitcherComponent } from '../lang-switcher/lang-switcher.component';
import { DialogComponent } from '../dialog/dialog.component';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslocoModule, LangSwitcherComponent, DialogComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  protected readonly authService = inject(AuthService);
  private readonly router        = inject(Router);
  private readonly api           = inject(ApiService);
  private readonly transloco     = inject(TranslocoService);

  readonly currentLang = toSignal(this.transloco.langChanges$, {
    initialValue: this.transloco.getActiveLang(),
  });

  menuOpen              = signal(false);
  tooltipOpen           = signal(false);
  activeSurveys         = signal<ActiveSurvey[]>([]);
  surveyOpen            = signal(false);
  selectedSurvey        = signal<ActiveSurvey | null>(null);
  selectedOption        = signal<number | null>(null);
  surveyDone            = signal(false);
  submitting            = signal(false);

  announcementTooltipOpen = signal(false);
  activeAnnouncements     = signal<ActiveAnnouncement[]>([]);
  announcementOpen        = signal(false);
  selectedAnnouncement    = signal<ActiveAnnouncement | null>(null);

  gamesDropdownOpen   = signal(false);
  genres              = signal<Genre[]>([]);
  activeMenuSection   = signal<'genres' | 'upcoming'>('genres');
  private openTimer:  ReturnType<typeof setTimeout> | null = null;
  private closeTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe(() => {
        this.menuOpen.set(false);
        this.gamesDropdownOpen.set(false);
      });

    toObservable(this.authService.currentUser)
      .pipe(takeUntilDestroyed())
      .subscribe(user => {
        if (user) { this.loadActiveSurveys(); this.loadActiveAnnouncements(); }
        else       { this.activeSurveys.set([]); this.activeAnnouncements.set([]); }
      });
  }

  private loadActiveSurveys(): void {
    this.api.getActiveSurveys().subscribe(s => this.activeSurveys.set(s));
  }

  private loadActiveAnnouncements(): void {
    this.api.getActiveAnnouncements().subscribe(a => this.activeAnnouncements.set(a));
  }

  onGamesEnter(): void {
    if (this.closeTimer) {
      clearTimeout(this.closeTimer);
      this.closeTimer = null;
    }
    if (!this.gamesDropdownOpen()) {
      this.openTimer = setTimeout(() => {
        if (!this.genres().length) {
          this.api.getGenres().subscribe(g => this.genres.set(g));
        }
        this.activeMenuSection.set('genres');
        this.gamesDropdownOpen.set(true);
      }, 1000);
    }
  }

  onGamesLeave(): void {
    if (this.openTimer) {
      clearTimeout(this.openTimer);
      this.openTimer = null;
    }
    this.closeTimer = setTimeout(() => {
      this.gamesDropdownOpen.set(false);
    }, 150);
  }

  genreName(genre: Genre): string {
    const lang = this.currentLang() ?? 'en';
    return genre.name[lang] || genre.name['en'] || Object.values(genre.name)[0] || '';
  }

  toggleAnnouncementTooltip(): void {
    this.announcementTooltipOpen.update(v => !v);
  }

  openAnnouncement(a: ActiveAnnouncement): void {
    this.selectedAnnouncement.set(a);
    this.announcementTooltipOpen.set(false);
    this.announcementOpen.set(true);
  }

  toggleTooltip(): void {
    this.tooltipOpen.update(v => !v);
  }

  openSurvey(survey: ActiveSurvey): void {
    this.selectedSurvey.set(survey);
    this.surveyDone.set(false);
    this.selectedOption.set(null);
    this.tooltipOpen.set(false);
    this.surveyOpen.set(true);
  }

  submitSurvey(): void {
    const survey = this.selectedSurvey();
    const option = this.selectedOption();
    if (!survey || option === null || this.submitting()) return;
    this.submitting.set(true);
    this.api.respondSurvey(survey.id, option).subscribe(() => {
      this.submitting.set(false);
      this.surveyDone.set(true);
      setTimeout(() => {
        const respondedId = this.selectedSurvey()?.id;
        this.surveyOpen.set(false);
        this.activeSurveys.update(list => list.filter(s => s.id !== respondedId));
        this.selectedSurvey.set(null);
      }, 2000);
    });
  }

  t(record: Record<string, string>): string {
    const lang = this.currentLang() ?? 'en';
    return record[lang] || record['en'] || Object.values(record)[0] || '';
  }

  toggleMenu(): void {
    this.menuOpen.update(v => !v);
  }

  @HostListener('document:click')
  closeTooltips(): void {
    this.tooltipOpen.set(false);
    this.announcementTooltipOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  closeAll(): void {
    this.menuOpen.set(false);
    this.tooltipOpen.set(false);
    this.announcementTooltipOpen.set(false);
    this.gamesDropdownOpen.set(false);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
