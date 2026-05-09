import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { BreadcrumbComponent, BreadcrumbItem } from '../../../shared/components/breadcrumb/breadcrumb.component';

interface FaqItem {
  q: string;
  a: string;
  open: ReturnType<typeof signal<boolean>>;
}

@Component({
  selector: 'app-faqs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [TranslocoModule, BreadcrumbComponent],
  templateUrl: './faqs.component.html',
  styleUrl: './faqs.component.css',
})
export class FaqsComponent {
  readonly breadcrumbs: BreadcrumbItem[] = [{ labelKey: 'footer.faqs' }];

  readonly items: FaqItem[] = Array.from({ length: 15 }, (_, i) => ({
    q: `faqs.q${i + 1}`,
    a: `faqs.a${i + 1}`,
    open: signal(false),
  }));

  toggle(item: FaqItem): void {
    item.open.update(v => !v);
  }
}
