import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { TranslocoService } from '@jsverse/transloco';
import { AuthService } from '../../core/services/auth.service';
import { RelevantReleasesComponent } from './relevant-releases/relevant-releases.component';
import { TrailersSectionComponent } from './trailers-section/trailers-section.component';
import { LandingHeroComponent } from './hero/landing-hero.component';

@Component({
  selector: 'app-landing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [RelevantReleasesComponent, TrailersSectionComponent, LandingHeroComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
})
export class LandingComponent implements OnInit {
  private readonly meta     = inject(Meta);
  private readonly titleSvc = inject(Title);
  private readonly t        = inject(TranslocoService);
  readonly auth             = inject(AuthService);

  ngOnInit(): void {
    const title = this.t.translate('meta.landing_title');
    const desc  = this.t.translate('meta.landing_description');
    this.titleSvc.setTitle(title);
    this.meta.updateTag({ name: 'description',         content: desc });
    this.meta.updateTag({ property: 'og:type',         content: 'website' });
    this.meta.updateTag({ property: 'og:title',        content: title });
    this.meta.updateTag({ property: 'og:description',  content: desc });
    this.meta.updateTag({ name: 'twitter:card',        content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title',       content: title });
    this.meta.updateTag({ name: 'twitter:description', content: desc });
  }
}
