import { Component, inject, OnInit, signal, computed, ChangeDetectionStrategy,
} from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { BadgesProgress } from '../../../core/models/user.model';

const REVIEW_LADDER   = ['critico-novel', 'critico-junior', 'critico-senior', 'critico-maestro', 'el-critico'];
const FOLLOWER_LADDER = ['critico-amigo', 'critico-solicitado', 'critico-fiable', 'critico-famoso', 'critico-influyente'];

type BadgeCategory = 'speed' | 'reviews' | 'followers';

const BADGE_CATEGORY: Record<string, BadgeCategory> = {
  'critico-rapido': 'speed',
  ...Object.fromEntries(REVIEW_LADDER.map(s   => [s, 'reviews'   as BadgeCategory])),
  ...Object.fromEntries(FOLLOWER_LADDER.map(s => [s, 'followers' as BadgeCategory])),
};

const BADGE_SVG: Record<BadgeCategory, string> = {
  speed:     'M7 2v11h3v9l7-12h-4l4-8z',
  reviews:   'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z',
  followers: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',
};

function visibleFromLadder(ladder: string[], progress: BadgesProgress, showCompleted: boolean): string[] {
  const result: string[] = [];
  for (const slug of ladder) {
    const bp = progress[slug];
    if (!bp) continue;
    if (bp.awarded) {
      if (showCompleted) result.push(slug);
    } else {
      result.push(slug);
      break;
    }
  }
  return result;
}

@Component({
  selector: 'app-user-badges',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [TranslocoModule],
  templateUrl: './user-badges.component.html',
  styleUrl: './user-badges.component.css',
})
export class UserBadgesComponent implements OnInit {
  private readonly api  = inject(ApiService);
  private readonly auth = inject(AuthService);

  readonly badgeProgress = signal<BadgesProgress | null>(null);
  readonly claiming      = signal<string | null>(null);
  readonly removing      = signal<string | null>(null);
  readonly showCompleted = signal(false);
  readonly justClaimed   = signal<string | null>(null);
  readonly isAdmin       = computed(() => this.auth.currentUser()?.role === 'admin');

  readonly visibleBadges = computed(() => {
    const p = this.badgeProgress();
    if (!p) return [];
    const show = this.showCompleted();
    const result: string[] = [];
    const rapido = p['critico-rapido'];
    if (rapido && (!rapido.awarded || show)) result.push('critico-rapido');
    result.push(...visibleFromLadder(REVIEW_LADDER, p, show));
    result.push(...visibleFromLadder(FOLLOWER_LADDER, p, show));
    return result;
  });

  readonly obtainedCount = computed(() =>
    Object.values(this.badgeProgress() ?? {}).filter(b => b.awarded).length
  );

  readonly totalCount = computed(() =>
    Object.keys(this.badgeProgress() ?? {}).length
  );

  ngOnInit(): void {
    this.api.getBadgeProgress().subscribe(p => this.badgeProgress.set(p));
  }

  badgeIconPath(slug: string): string {
    return BADGE_SVG[BADGE_CATEGORY[slug] ?? 'reviews'];
  }

  formatDate(dateStr: string): string {
    return new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(dateStr));
  }

  claimBadge(slug: string): void {
    if (this.claiming()) return;
    this.claiming.set(slug);
    this.api.claimBadge(slug).subscribe({
      next: () => {
        this.badgeProgress.update(p => p ? {
          ...p,
          [slug]: { ...p[slug], awarded: true, claimable: false },
        } : p);
        this.claiming.set(null);
        this.justClaimed.set(slug);
        setTimeout(() => this.justClaimed.set(null), 900);
      },
      error: () => this.claiming.set(null),
    });
  }

  removeBadge(slug: string): void {
    if (this.removing()) return;
    this.removing.set(slug);
    this.api.removeBadge(slug).subscribe({
      next: () => {
        this.badgeProgress.update(p => p ? {
          ...p,
          [slug]: { ...p[slug], awarded: false, claimable: true },
        } : p);
        this.removing.set(null);
      },
      error: () => this.removing.set(null),
    });
  }
}
