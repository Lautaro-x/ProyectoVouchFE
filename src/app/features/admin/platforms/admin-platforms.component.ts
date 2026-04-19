import { Component, inject, OnInit, signal, ChangeDetectionStrategy,
} from '@angular/core';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { AdminApiService } from '../services/admin-api.service';
import { Platform } from '../models/admin.models';
import { DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { AdminTableBase } from '../admin-table.base';

@Component({
  selector: 'app-admin-platforms',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoModule, DialogComponent],
  templateUrl: './admin-platforms.component.html',
  styleUrl: './admin-platforms.component.css',
})
export class AdminPlatformsComponent extends AdminTableBase<Platform> implements OnInit {
  private api = inject(AdminApiService);
  private t   = inject(TranslocoService);

  filterType = signal('');

  formDialogOpen  = signal(false);
  formDialogTitle = signal('');
  formName        = signal('');
  formType        = signal<'console' | 'pc' | 'streaming'>('console');

  ngOnInit(): void { this.load(); }

  load(p = 1): void {
    const params: Record<string, string> = {
      page: String(p),
      per_page: String(this.perPage()),
      sort_by: this.sortBy(),
      sort_dir: this.sortDir(),
    };
    if (this.filterSearch()) params['search'] = this.filterSearch();
    if (this.filterType()) params['type'] = this.filterType();
    this.api.getPlatforms(params).subscribe(data => this.page.set(data));
  }

  openCreate(): void {
    this.formName.set('');
    this.formType.set('console');
    this.formDialogTitle.set(this.t.translate('admin.platforms.new_title'));
    this.formDialogOpen.set(true);
  }

  save(): void {
    const payload = { name: this.formName(), type: this.formType() };
    this.api.createPlatform(payload).subscribe(() => {
      this.formDialogOpen.set(false);
      this.load(this.page()?.current_page ?? 1);
    });
  }

  closeFormDialog(): void { this.formDialogOpen.set(false); }
}
