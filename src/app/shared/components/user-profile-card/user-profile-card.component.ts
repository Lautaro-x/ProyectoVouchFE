import {
  Component, Input, Output, EventEmitter, inject, signal, ChangeDetectionStrategy,
} from '@angular/core';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { UserCardData, UserCardReview } from '../../../core/models/user.model';
import { IgdbCoverPipe } from '../../pipes/igdb-cover.pipe';

const GRADE_HEX: Record<string, string> = {
  S: '#ffffff', 'A+': '#ffd600', A: '#69f0ae', 'B+': '#00e5ff', B: '#40c4ff',
  'C+': '#ea80fc', C: '#ffd740', 'D+': '#ff6e40', D: '#ff9100',
  'E+': '#ff3d00', E: '#ff1744', F: '#ff5252',
};
const REVIEW_LADDER   = ['el-critico', 'critico-maestro', 'critico-senior', 'critico-junior', 'critico-novel'];
const FOLLOWER_LADDER = ['critico-influyente', 'critico-famoso', 'critico-fiable', 'critico-solicitado', 'critico-amigo'];
const BADGE_LABELS: Record<string, string> = {
  'critico-rapido':     'Crítico Rápido',
  'critico-novel':      'Crítico Novel',
  'critico-junior':     'Crítico Junior',
  'critico-senior':     'Crítico Senior',
  'critico-maestro':    'Crítico Maestro',
  'el-critico':         'El Crítico',
  'critico-amigo':      'Crítico Amigo',
  'critico-solicitado': 'Crítico Solicitado',
  'critico-fiable':     'Crítico Fiable',
  'critico-famoso':     'Crítico Famoso',
  'critico-influyente': 'Crítico Influyente',
};

@Component({
  selector: 'app-user-profile-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [IgdbCoverPipe, TranslocoModule],
  templateUrl: './user-profile-card.component.html',
  styleUrl: './user-profile-card.component.css',
})
export class UserProfileCardComponent {
  @Input({ required: true }) card!: UserCardData;
  @Input() responsive      = false;
  @Input() following       = false;
  @Input() followBusy      = false;
  @Input() isSelf          = false;
  @Input() isAuthenticated = false;
  @Output() readonly followClick = new EventEmitter<void>();

  private readonly transloco = inject(TranslocoService);
  readonly avatarBroken = signal(false);

  get isVerified(): boolean {
    return this.card?.badges?.includes('verificado') ?? false;
  }

  get displayBadges(): string[] {
    const badges = this.card?.badges ?? [];
    const result: string[] = [];
    const topReview   = REVIEW_LADDER.find(b => badges.includes(b));
    const topFollower = FOLLOWER_LADDER.find(b => badges.includes(b));
    if (topReview)   result.push(topReview);
    if (topFollower) result.push(topFollower);
    if (badges.includes('critico-rapido')) result.push('critico-rapido');
    return result;
  }

  get socialEntries(): Array<[string, string]> {
    return (Object.entries(this.card?.social_links ?? {}) as Array<[string, string]>)
      .filter(([, url]) => !!url);
  }

  get fullReviews(): UserCardReview[] {
    return this.card?.last_reviews?.slice(0, 3) ?? [];
  }

  onAvatarError(): void { this.avatarBroken.set(true); }
  onFollowClick(): void { this.followClick.emit(); }
  gradeHex(grade: string): string  { return GRADE_HEX[grade] ?? '#9e9e9e'; }
  badgeLabel(slug: string): string { return this.transloco.translate(`badges.${slug}`); }
}
