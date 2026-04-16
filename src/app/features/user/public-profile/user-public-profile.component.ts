import { Component, computed, inject, OnInit, signal, DOCUMENT } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserCardData } from '../../../core/models/user.model';
import { IgdbCoverPipe } from '../../../shared/pipes/igdb-cover.pipe';

const GRADE_HEX: Record<string, string> = {
  S:  '#ffffff',
  'A+': '#ffd600', A:  '#69f0ae',
  'B+': '#00e5ff', B:  '#40c4ff',
  'C+': '#ea80fc', C:  '#ffd740',
  'D+': '#ff6e40', D:  '#ff9100',
  'E+': '#ff3d00', E:  '#ff1744',
  F:  '#ff5252',
};

const BADGE_HEX: Record<string, string> = {
  verified:      '#6200EE',
  top_critic:    '#f4a261',
  early_adopter: '#7c4dff',
  beta_tester:   '#00b894',
};

@Component({
  selector: 'app-user-public-profile',
  standalone: true,
  imports: [TranslocoModule, IgdbCoverPipe],
  templateUrl: './user-public-profile.component.html',
  styleUrl: './user-public-profile.component.css',
})
export class UserPublicProfileComponent implements OnInit {
  private readonly api  = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly doc  = inject(DOCUMENT);

  readonly loading      = signal(true);
  readonly card         = signal<UserCardData | null>(null);
  readonly savingBg     = signal(false);
  readonly savedBg      = signal(false);
  readonly avatarBroken = signal(false);

  readonly fullBg  = signal('');
  readonly midBg   = signal('');
  readonly miniBg  = signal('');

  readonly isSelf = computed(() =>
    this.card()?.id === this.auth.currentUser()?.id
  );

  readonly copiedBig  = signal(false);
  readonly copiedMid  = signal(false);
  readonly copiedMini = signal(false);

  copyLink(type: 'big' | 'mid' | 'mini'): void {
    const id  = this.card()?.id;
    if (!id) return;
    const url = `${this.doc.location.origin}/card/${type}/${id}`;
    navigator.clipboard.writeText(url).then(() => {
      if (type === 'big')  { this.copiedBig.set(true);  setTimeout(() => this.copiedBig.set(false),  2000); }
      if (type === 'mid')  { this.copiedMid.set(true);  setTimeout(() => this.copiedMid.set(false),  2000); }
      if (type === 'mini') { this.copiedMini.set(true); setTimeout(() => this.copiedMini.set(false), 2000); }
    });
  }

  readonly socialEntries = computed(() =>
    Object.entries(this.card()?.social_links ?? {}).filter(([, url]) => !!url)
  );

  readonly fullReviews    = computed(() => this.card()?.last_reviews?.slice(0, 3) ?? []);
  readonly summaryReviews = computed(() => this.card()?.last_reviews?.slice(0, 5) ?? []);

  readonly publicProfileUrl = computed(() => {
    const id = this.card()?.id;
    if (!id) return '';
    return `${this.doc.location.origin}/u/${id}`;
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

  onAvatarError(): void { this.avatarBroken.set(true); }

  gradeHex(grade: string): string {
    return GRADE_HEX[grade] ?? '#9e9e9e';
  }

  badgeHex(slug: string): string {
    return BADGE_HEX[slug] ?? '#9e9e9e';
  }
}
