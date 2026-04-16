import { Component, inject, OnInit, signal, computed, DOCUMENT } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { UserCardData } from '../../../core/models/user.model';
import { IgdbCoverPipe } from '../../../shared/pipes/igdb-cover.pipe';

const GRADE_HEX: Record<string, string> = {
  S: '#ffffff', 'A+': '#ffd600', A: '#69f0ae', 'B+': '#00e5ff', B: '#40c4ff',
  'C+': '#ea80fc', C: '#ffd740', 'D+': '#ff6e40', D: '#ff9100',
  'E+': '#ff3d00', E: '#ff1744', F: '#ff5252',
};
const BADGE_HEX: Record<string, string> = {
  verified: '#6200EE', top_critic: '#f4a261', early_adopter: '#7c4dff', beta_tester: '#00b894',
};

@Component({
  selector: 'app-big-card-page',
  standalone: true,
  imports: [IgdbCoverPipe],
  templateUrl: './big-card-page.component.html',
  styleUrl: './big-card-page.component.css',
})
export class BigCardPageComponent implements OnInit {
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
  readonly fullReviews = computed(() => this.card()?.last_reviews?.slice(0, 3) ?? []);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getPublicCard(id).subscribe(data => {
      this.card.set(data);
      this.setOgTags(data);
    });
  }

  private setOgTags(data: UserCardData): void {
    const url  = `${this.doc.location.origin}/card/big/${data.id}`;
    const desc = `${data.reviews_count} reseñas · ${data.followers_count} seguidores`;
    this.title.setTitle(`${data.name} — Vouch`);
    this.meta.updateTag({ property: 'og:type',        content: 'profile' });
    this.meta.updateTag({ property: 'og:url',         content: url });
    this.meta.updateTag({ property: 'og:title',       content: `${data.name} en Vouch` });
    this.meta.updateTag({ property: 'og:description', content: desc });
    this.meta.updateTag({ property: 'og:image',       content: data.avatar ?? '' });
    this.meta.updateTag({ name: 'twitter:card',        content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title',       content: `${data.name} en Vouch` });
    this.meta.updateTag({ name: 'twitter:description', content: desc });
    this.meta.updateTag({ name: 'twitter:image',       content: data.avatar ?? '' });
  }

  onAvatarError(): void { this.avatarBroken.set(true); }
  gradeHex(grade: string): string { return GRADE_HEX[grade] ?? '#9e9e9e'; }
  badgeHex(slug: string): string  { return BADGE_HEX[slug]  ?? '#9e9e9e'; }
}
