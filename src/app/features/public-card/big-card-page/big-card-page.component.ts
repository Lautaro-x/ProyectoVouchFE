import { Component, inject, OnInit, signal, DOCUMENT, ChangeDetectionStrategy,
} from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { UserCardData } from '../../../core/models/user.model';
import { UserProfileCardComponent } from '../../../shared/components/user-profile-card/user-profile-card.component';

@Component({
  selector: 'app-big-card-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [UserProfileCardComponent],
  templateUrl: './big-card-page.component.html',
  styleUrl: './big-card-page.component.css',
})
export class BigCardPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api   = inject(ApiService);
  private readonly meta  = inject(Meta);
  private readonly title = inject(Title);
  private readonly doc   = inject(DOCUMENT);

  readonly card = signal<UserCardData | null>(null);

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
}
