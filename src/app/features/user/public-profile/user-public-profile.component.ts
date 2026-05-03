import { Component, computed, inject, OnInit, signal, DOCUMENT, PLATFORM_ID,
  ChangeDetectionStrategy,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import { ApiService } from '../../../core/services/api.service';
import { UserCardData } from '../../../core/models/user.model';
import { UserProfileCardComponent } from '../../../shared/components/user-profile-card/user-profile-card.component';
import { UserMidCardComponent } from '../../../shared/components/user-mid-card/user-mid-card.component';
import { UserMiniCardComponent } from '../../../shared/components/user-mini-card/user-mini-card.component';
import { DialogComponent } from '../../../shared/components/dialog/dialog.component';

@Component({
  selector: 'app-user-public-profile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [TranslocoModule, UserProfileCardComponent, UserMidCardComponent, UserMiniCardComponent, DialogComponent],
  templateUrl: './user-public-profile.component.html',
  styleUrl: './user-public-profile.component.css',
})
export class UserPublicProfileComponent implements OnInit {
  private readonly api        = inject(ApiService);
  private readonly doc        = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  readonly loading  = signal(true);
  readonly card     = signal<UserCardData | null>(null);
  readonly savingBg = signal(false);
  readonly savedBg  = signal(false);

  readonly fullBg = signal('');
  readonly midBg  = signal('');
  readonly miniBg = signal('');

  readonly copyDialogOpen = signal(false);
  readonly copyDialogType = signal<'big' | 'mid' | 'mini' | null>(null);
  readonly copyDialogUrl  = signal('');

  readonly previewBigCard = computed<UserCardData | null>(() => {
    const c = this.card();
    if (!c) return null;
    return { ...c, card_big_bg: this.fullBg() || null };
  });

  readonly previewMidCard = computed<UserCardData | null>(() => {
    const c = this.card();
    if (!c) return null;
    return { ...c, card_mid_bg: this.midBg() || null };
  });

  readonly previewMiniCard = computed<UserCardData | null>(() => {
    const c = this.card();
    if (!c) return null;
    return { ...c, card_mini_bg: this.miniBg() || null };
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
      this.copyDialogUrl.set(url);
      this.copyDialogType.set(type);
      this.copyDialogOpen.set(true);
    });
  }
}
