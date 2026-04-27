import { Component, inject, OnInit, signal, computed, DOCUMENT, ChangeDetectionStrategy,
} from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { UserCardData } from '../../core/models/user.model';
import { DialogComponent } from '../../shared/components/dialog/dialog.component';
import { UserProfileCardComponent } from '../../shared/components/user-profile-card/user-profile-card.component';

@Component({
  selector: 'app-public-profile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [DialogComponent, UserProfileCardComponent],
  templateUrl: './public-profile.component.html',
  styleUrl: './public-profile.component.css',
})
export class PublicProfileComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api   = inject(ApiService);
  readonly auth          = inject(AuthService);
  private readonly meta  = inject(Meta);
  private readonly title = inject(Title);
  private readonly doc   = inject(DOCUMENT);

  readonly card               = signal<UserCardData | null>(null);
  readonly loading            = signal(true);
  readonly following          = signal(false);
  readonly followBusy         = signal(false);
  readonly unfollowDialogOpen = signal(false);

  readonly isSelf = computed(() =>
    !!this.auth.currentUser() && this.card()?.id === this.auth.currentUser()!.id
  );

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getPublicCard(id).subscribe({
      next: data => {
        this.card.set(data);
        this.following.set(data.is_following);
        this.loading.set(false);
        this.setOgTags(data);
      },
      error: () => this.loading.set(false),
    });
  }

  onFollowClick(): void {
    if (this.following()) {
      this.unfollowDialogOpen.set(true);
    } else {
      this.doFollow();
    }
  }

  confirmUnfollow(): void {
    this.unfollowDialogOpen.set(false);
    this.doUnfollow();
  }

  private doFollow(): void {
    const id = this.card()?.id;
    if (!id || this.followBusy()) return;
    this.followBusy.set(true);
    this.api.followUser(id).subscribe({
      next: () => {
        this.following.set(true);
        this.card.update(c => c ? { ...c, followers_count: c.followers_count + 1 } : c);
        this.followBusy.set(false);
      },
      error: () => this.followBusy.set(false),
    });
  }

  private doUnfollow(): void {
    const id = this.card()?.id;
    if (!id || this.followBusy()) return;
    this.followBusy.set(true);
    this.api.unfollowUser(id).subscribe({
      next: () => {
        this.following.set(false);
        this.card.update(c => c ? { ...c, followers_count: c.followers_count - 1 } : c);
        this.followBusy.set(false);
      },
      error: () => this.followBusy.set(false),
    });
  }

  private setOgTags(data: UserCardData): void {
    const url  = `${this.doc.location.origin}/u/${data.id}`;
    const desc = `${data.reviews_count} reviews · ${data.followers_count} followers`;
    this.title.setTitle(`${data.name} — Vouch`);
    this.meta.updateTag({ property: 'og:type',        content: 'profile' });
    this.meta.updateTag({ property: 'og:url',         content: url });
    this.meta.updateTag({ property: 'og:title',       content: `${data.name} on Vouch` });
    this.meta.updateTag({ property: 'og:description', content: desc });
    this.meta.updateTag({ property: 'og:image',       content: data.avatar ?? '' });
    this.meta.updateTag({ name: 'twitter:card',        content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title',       content: `${data.name} on Vouch` });
    this.meta.updateTag({ name: 'twitter:description', content: desc });
    this.meta.updateTag({ name: 'twitter:image',       content: data.avatar ?? '' });
  }
}
