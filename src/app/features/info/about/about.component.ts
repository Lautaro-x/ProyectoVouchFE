import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { BreadcrumbComponent, BreadcrumbItem } from '../../../shared/components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-about',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [TranslocoModule, BreadcrumbComponent],
  templateUrl: './about.component.html',
})
export class AboutComponent {
  readonly breadcrumbs: BreadcrumbItem[] = [{ labelKey: 'footer.about' }];
}
