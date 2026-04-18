import { Component, inject, OnInit, signal, computed, ChangeDetectionStrategy,
} from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { BadgesProgress } from '../../../core/models/user.model';

const REVIEW_LADDER   = ['critico-novel', 'critico-junior', 'critico-senior', 'critico-maestro', 'el-critico'];
const FOLLOWER_LADDER = ['critico-amigo', 'critico-solicitado', 'critico-fiable', 'critico-famoso', 'critico-influyente'];

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

  readonly badgeProgress  = signal<BadgesProgress | null>(null);
  readonly claiming       = signal<string | null>(null);
  readonly removing       = signal<string | null>(null);
  readonly showCompleted  = signal(false);
  readonly isAdmin        = computed(() => this.auth.currentUser()?.role === 'admin');

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

  ngOnInit(): void {
    this.api.getBadgeProgress().subscribe(p => this.badgeProgress.set(p));
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
