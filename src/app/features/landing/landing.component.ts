import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RelevantReleasesComponent } from './relevant-releases/relevant-releases.component';
import { TrailersSectionComponent } from './trailers-section/trailers-section.component';

@Component({
  selector: 'app-landing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [RelevantReleasesComponent, TrailersSectionComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
})
export class LandingComponent implements OnInit {
  private readonly meta     = inject(Meta);
  private readonly titleSvc = inject(Title);

  ngOnInit(): void {
    const desc = 'Social platform with weighted video game reviews.';
    this.titleSvc.setTitle('Vouch — Weighted video game reviews');
    this.meta.updateTag({ name: 'description',         content: desc });
    this.meta.updateTag({ property: 'og:type',         content: 'website' });
    this.meta.updateTag({ property: 'og:title',        content: 'Vouch — Weighted video game reviews' });
    this.meta.updateTag({ property: 'og:description',  content: desc });
    this.meta.updateTag({ name: 'twitter:card',        content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title',       content: 'Vouch — Weighted video game reviews' });
    this.meta.updateTag({ name: 'twitter:description', content: desc });
  }
}
