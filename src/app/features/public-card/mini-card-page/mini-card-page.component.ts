import { Component, inject, OnInit, signal, DOCUMENT, ChangeDetectionStrategy,
} from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { UserCardData } from '../../../core/models/user.model';
import { UserMiniCardComponent } from '../../../shared/components/user-mini-card/user-mini-card.component';

@Component({
  selector: 'app-mini-card-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [UserMiniCardComponent],
  templateUrl: './mini-card-page.component.html',
  styleUrl: './mini-card-page.component.css',
})
export class MiniCardPageComponent implements OnInit {
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
    const url  = `${this.doc.location.origin}/card/mini/${data.id}`;
    const desc = `${data.reviews_count} reviews · ${data.followers_count} followers`;
    this.title.setTitle(`${data.name} — Vouch`);
    this.meta.updateTag({ property: 'og:type',        content: 'profile' });
    this.meta.updateTag({ property: 'og:url',         content: url });
    this.meta.updateTag({ property: 'og:title',       content: `${data.name} on Vouch` });
    this.meta.updateTag({ property: 'og:description', content: desc });
    this.meta.updateTag({ property: 'og:image',       content: data.avatar ?? '' });
    this.meta.updateTag({ name: 'twitter:card',        content: 'summary' });
    this.meta.updateTag({ name: 'twitter:title',       content: `${data.name} on Vouch` });
    this.meta.updateTag({ name: 'twitter:description', content: desc });
    this.meta.updateTag({ name: 'twitter:image',       content: data.avatar ?? '' });
  }
}
