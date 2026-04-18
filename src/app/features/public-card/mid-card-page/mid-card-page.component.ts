import { Component, inject, OnInit, signal, computed, DOCUMENT, ChangeDetectionStrategy,
} from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { ApiService } from '../../../core/services/api.service';
import { UserCardData } from '../../../core/models/user.model';

const REVIEW_LADDER   = ['el-critico', 'critico-maestro', 'critico-senior', 'critico-junior', 'critico-novel'];
const FOLLOWER_LADDER = ['critico-influyente', 'critico-famoso', 'critico-fiable', 'critico-solicitado', 'critico-amigo'];

@Component({
  selector: 'app-mid-card-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [TranslocoModule],
  templateUrl: './mid-card-page.component.html',
  styleUrl: './mid-card-page.component.css',
})
export class MidCardPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api   = inject(ApiService);
  private readonly meta  = inject(Meta);
  private readonly title = inject(Title);
  private readonly doc   = inject(DOCUMENT);

  readonly card         = signal<UserCardData | null>(null);
  readonly avatarBroken = signal(false);
  readonly socialEntries = computed(() =>
    Object.entries(this.card()?.social_links ?? {}).filter(([, url]) => !!url)
  );
  readonly summaryReviews = computed(() => this.card()?.last_reviews?.slice(0, 5) ?? []);

  readonly isVerified = computed(() =>
    this.card()?.badges?.includes('verificado') ?? false
  );
  readonly displayBadges = computed(() => {
    const badges = this.card()?.badges ?? [];
    const result: string[] = [];
    const topReview   = REVIEW_LADDER.find(b => badges.includes(b));
    const topFollower = FOLLOWER_LADDER.find(b => badges.includes(b));
    if (topReview)   result.push(topReview);
    if (topFollower) result.push(topFollower);
    if (badges.includes('critico-rapido')) result.push('critico-rapido');
    return result;
  });
  readonly publicProfileUrl = computed(() => {
    const id = this.card()?.id;
    return id ? `${this.doc.location.origin}/u/${id}` : '';
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getPublicCard(id).subscribe(data => {
      this.card.set(data);
      this.setOgTags(data);
    });
  }

  private setOgTags(data: UserCardData): void {
    const url  = `${this.doc.location.origin}/card/mid/${data.id}`;
    const desc = `${data.reviews_count} reseñas · ${data.followers_count} seguidores`;
    this.title.setTitle(`${data.name} — Vouch`);
    this.meta.updateTag({ property: 'og:type',        content: 'profile' });
    this.meta.updateTag({ property: 'og:url',         content: url });
    this.meta.updateTag({ property: 'og:title',       content: `${data.name} en Vouch` });
    this.meta.updateTag({ property: 'og:description', content: desc });
    this.meta.updateTag({ property: 'og:image',       content: data.avatar ?? '' });
    this.meta.updateTag({ name: 'twitter:card',        content: 'summary' });
    this.meta.updateTag({ name: 'twitter:title',       content: `${data.name} en Vouch` });
    this.meta.updateTag({ name: 'twitter:description', content: desc });
    this.meta.updateTag({ name: 'twitter:image',       content: data.avatar ?? '' });
  }

  onAvatarError(): void { this.avatarBroken.set(true); }
}
