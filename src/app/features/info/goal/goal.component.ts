import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { BreadcrumbComponent, BreadcrumbItem } from '../../../shared/components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-goal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [TranslocoModule, BreadcrumbComponent],
  templateUrl: './goal.component.html',
  styleUrl: './goal.component.css',
})
export class GoalComponent {
  readonly breadcrumbs: BreadcrumbItem[] = [{ labelKey: 'footer.goal' }];
}
