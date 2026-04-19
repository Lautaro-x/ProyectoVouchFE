import { Component, computed, inject, OnInit, signal, DOCUMENT, PLATFORM_ID, ChangeDetectionStrategy,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserCardData } from '../../../core/models/user.model';
import { UserProfileCardComponent } from '../../../shared/components/user-profile-card/user-profile-card.component';

const REVIEW_LADDER   = ['el-critico', 'critico-maestro', 'critico-senior', 'critico-junior', 'critico-novel'];
const FOLLOWER_LADDER = ['critico-influyente', 'critico-famoso', 'critico-fiable', 'critico-solicitado', 'critico-amigo'];

@Component({
  selector: 'app-user-public-profile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [TranslocoModule, UserProfileCardComponent],
  templateUrl: './user-public-profile.component.html',
  styleUrl: './user-public-profile.component.css',
})
export class UserPublicProfileComponent implements OnInit {
  private readonly api        = inject(ApiService);
  private readonly auth       = inject(AuthService);
  private readonly doc        = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  readonly loading      = signal(true);
  readonly card         = signal<UserCardData | null>(null);
  readonly savingBg     = signal(false);
  readonly savedBg      = signal(false);
  readonly avatarBroken = signal(false);

  readonly fullBg  = signal('');
  readonly midBg   = signal('');
  readonly miniBg  = signal('');

  readonly copiedBig  = signal(false);
  readonly copiedMid  = signal(false);
  readonly copiedMini = signal(false);

  readonly previewBigCard = computed<UserCardData | null>(() => {
    const c = this.card();
    if (!c) return null;
    return { ...c, card_big_bg: this.fullBg() || null };
  });

  readonly socialEntries = computed(() =>
    Object.entries(this.card()?.social_links ?? {}).filter(([, url]) => !!url)
  );
  readonly summaryReviews = computed(() => this.card()?.last_reviews?.slice(0, 5) ?? []);

  readonly publicProfileUrl = computed(() => {
    const id = this.card()?.id;
    return id ? `${this.doc.location.origin}/u/${id}` : '';
  });

  ngOnInit(): void {
    this.api.getUserCardData().subscribe(data => {
      this.card.set(data);
      this.fullBg.set(data.card_big_bg ?? '');
      this.midBg.set(data.card_mid_bg ?? '');
      this.miniBg.set(data.card_mini_bg ?? '');
      this.loading.set(false);
    });
  }

  saveBackgrounds(): void {
    this.savingBg.set(true);
    this.savedBg.set(false);
    this.api.updateProfile({
      card_big_bg:  this.fullBg() || null,
      card_mid_bg:  this.midBg() || null,
      card_mini_bg: this.miniBg() || null,
    }).subscribe(() => {
      this.savingBg.set(false);
      this.savedBg.set(true);
      setTimeout(() => this.savedBg.set(false), 3000);
    });
  }

  copyLink(type: 'big' | 'mid' | 'mini'): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const id = this.card()?.id;
    if (!id) return;
    const url = `${this.doc.location.origin}/card/${type}/${id}`;
    navigator.clipboard.writeText(url).then(() => {
      if (type === 'big')  { this.copiedBig.set(true);  setTimeout(() => this.copiedBig.set(false),  2000); }
      if (type === 'mid')  { this.copiedMid.set(true);  setTimeout(() => this.copiedMid.set(false),  2000); }
      if (type === 'mini') { this.copiedMini.set(true); setTimeout(() => this.copiedMini.set(false), 2000); }
    });
  }

  onAvatarError(): void { this.avatarBroken.set(true); }

  displayBadges(badges: string[]): string[] {
    const result: string[] = [];
    const topReview   = REVIEW_LADDER.find(b => badges.includes(b));
    const topFollower = FOLLOWER_LADDER.find(b => badges.includes(b));
    if (topReview)   result.push(topReview);
    if (topFollower) result.push(topFollower);
    if (badges.includes('critico-rapido')) result.push('critico-rapido');
    return result;
  }

  isVerified(badges: string[]): boolean { return badges.includes('verificado'); }
}
