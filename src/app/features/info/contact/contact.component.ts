import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { BreadcrumbComponent, BreadcrumbItem } from '../../../shared/components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-contact',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [TranslocoModule, BreadcrumbComponent],
  templateUrl: './contact.component.html',
})
export class ContactComponent {
  readonly breadcrumbs: BreadcrumbItem[] = [{ labelKey: 'footer.contact' }];
}
