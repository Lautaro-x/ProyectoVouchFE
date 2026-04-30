import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { BreadcrumbComponent, BreadcrumbItem } from '../../../shared/components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-faqs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [TranslocoModule, BreadcrumbComponent],
  templateUrl: './faqs.component.html',
})
export class FaqsComponent {
  readonly breadcrumbs: BreadcrumbItem[] = [{ labelKey: 'footer.faqs' }];
}
