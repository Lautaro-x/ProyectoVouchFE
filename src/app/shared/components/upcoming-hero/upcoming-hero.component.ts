import { Component, ChangeDetectionStrategy, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { HeroGame } from '../../../core/models/product.model';

@Component({
  selector: 'app-upcoming-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [TranslocoModule, RouterLink],
  templateUrl: './upcoming-hero.component.html',
  styleUrl: './upcoming-hero.component.css',
})
export class UpcomingHeroComponent {
  private readonly t = inject(TranslocoService);

  readonly game = input.required<HeroGame>();

  gradeClass = computed(() => {
    const g = this.game().letter_grade;
    return g ? g.replace('+', 'plus').replace('-', 'minus').toLowerCase() : '';
  });

  formatDate(dateStr: string | null): string {
    if (!dateStr) return '';
    const d = new Date(dateStr.substring(0, 10) + 'T12:00:00');
    if (isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat(this.t.getActiveLang(), { month: 'long', day: 'numeric', year: 'numeric' }).format(d);
  }

  openTrailer(): void {
    const id = this.game().trailer_youtube_id;
    if (!id) return;
    window.open(`https://www.youtube.com/watch?v=${id}`, '_blank', 'noopener');
  }
}
