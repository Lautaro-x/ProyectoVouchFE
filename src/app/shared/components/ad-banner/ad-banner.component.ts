import { afterNextRender, ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-ad-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [TranslocoModule],
  templateUrl: './ad-banner.component.html',
  styleUrl: './ad-banner.component.css',
})
export class AdBannerComponent {
  adSlot = input.required<string>();

  readonly adClient = 'ca-pub-9130792052986864';

  constructor() {
    afterNextRender(() => {
      try {
        (window as any)['adsbygoogle'] = (window as any)['adsbygoogle'] || [];
        (window as any)['adsbygoogle'].push({});
      } catch {}
    });
  }
}
