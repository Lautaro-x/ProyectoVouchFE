import { Component, input, signal, computed, inject, DOCUMENT,
  ChangeDetectionStrategy,
} from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { UserCardData, SOCIAL_NETWORK_MAP } from '../../../core/models/user.model';
import { IgdbCoverPipe } from '../../pipes/igdb-cover.pipe';

const REVIEW_LADDER   = ['el-critico', 'critico-maestro', 'critico-senior', 'critico-junior', 'critico-novel'];
const FOLLOWER_LADDER = ['critico-influyente', 'critico-famoso', 'critico-fiable', 'critico-solicitado', 'critico-amigo'];

@Component({
  selector: 'app-user-mid-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [TranslocoModule, IgdbCoverPipe],
  templateUrl: './user-mid-card.component.html',
  styleUrl: './user-mid-card.component.css',
})
export class UserMidCardComponent {
  private readonly doc = inject(DOCUMENT);

  readonly card = input.required<UserCardData>();

  readonly avatarBroken  = signal(false);
  readonly isVerified    = computed(() => this.card().badges?.includes('verificado') ?? false);
  readonly displayBadges = computed(() => {
    const badges = this.card().badges ?? [];
    const result: string[] = [];
    const topReview   = REVIEW_LADDER.find(b => badges.includes(b));
    const topFollower = FOLLOWER_LADDER.find(b => badges.includes(b));
    if (topReview)   result.push(topReview);
    if (topFollower) result.push(topFollower);
    if (badges.includes('critico-rapido')) result.push('critico-rapido');
    return result;
  });
  readonly socialEntries = computed(() =>
    Object.entries(this.card().social_links ?? {}).filter((e): e is [string, string] => !!e[1])
  );
  readonly summaryReviews = computed(() => this.card().last_reviews?.slice(0, 4) ?? []);
  readonly publicProfileUrl = computed(() =>
    `${this.doc.location.origin}/u/${this.card().id}`
  );

  onAvatarError(): void { this.avatarBroken.set(true); }
  gradeClass(grade: string): string {
    return 'grade-' + grade.replace('+', 'plus').replace('-', 'minus').toLowerCase();
  }
  netSvgPath(key: string): string { return SOCIAL_NETWORK_MAP[key]?.svgPath ?? ''; }
}
