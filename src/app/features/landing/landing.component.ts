import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { TranslocoService } from '@jsverse/transloco';
import { combineLatest, take } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { RelevantReleasesComponent } from './relevant-releases/relevant-releases.component';
import { TrailersSectionComponent } from './trailers-section/trailers-section.component';
import { LandingHeroComponent } from './hero/landing-hero.component';
import { AdBannerComponent } from '../../shared/components/ad-banner/ad-banner.component';

@Component({
  selector: 'app-landing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [RelevantReleasesComponent, TrailersSectionComponent, LandingHeroComponent, AdBannerComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
})
export class LandingComponent implements OnInit {
  private readonly meta     = inject(Meta);
  private readonly titleSvc = inject(Title);
  private readonly t        = inject(TranslocoService);
  readonly auth             = inject(AuthService);

  ngOnInit(): void {
    combineLatest([
      this.t.selectTranslate('meta.landing_title'),
      this.t.selectTranslate('meta.landing_description'),
    ]).pipe(take(1)).subscribe(([title, desc]) => {
      this.titleSvc.setTitle(title);
      this.meta.updateTag({ name: 'description',         content: desc });
      this.meta.updateTag({ property: 'og:type',         content: 'website' });
      this.meta.updateTag({ property: 'og:title',        content: title });
      this.meta.updateTag({ property: 'og:description',  content: desc });
      this.meta.updateTag({ name: 'twitter:card',        content: 'summary_large_image' });
      this.meta.updateTag({ name: 'twitter:title',       content: title });
      this.meta.updateTag({ name: 'twitter:description', content: desc });
    });
  }
}
