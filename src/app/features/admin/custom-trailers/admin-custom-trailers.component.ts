import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { AdminApiService } from '../services/admin-api.service';
import { CustomTrailerItem } from '../models/admin.models';
import { LANGS } from '../../../core/constants/langs';

@Component({
  selector: 'app-admin-custom-trailers',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [TranslocoModule],
  templateUrl: './admin-custom-trailers.component.html',
  styleUrl: './admin-custom-trailers.component.css',
})
export class AdminCustomTrailersComponent implements OnInit {
  private readonly api = inject(AdminApiService);

  readonly LANGS = LANGS;

  activeLang = signal<string>('es');
  title      = signal<Record<string, string>>({});
  isActive   = signal(false);
  items      = signal<CustomTrailerItem[]>([]);
  saving     = signal(false);
  adding     = signal(false);
  newName    = signal('');
  newUrl     = signal('');

  ngOnInit(): void {
    this.api.getCustomTrailerSection().subscribe(s => {
      this.title.set(s.title ?? {});
      this.isActive.set(s.is_active);
      this.items.set(s.items);
    });
  }

  setTitle(lang: string, value: string): void {
    this.title.update(t => ({ ...t, [lang]: value }));
  }

  saveSection(): void {
    if (this.saving()) return;
    this.saving.set(true);
    this.api.updateCustomTrailerSection({ title: this.title(), is_active: this.isActive() })
      .subscribe({
        next: ()  => this.saving.set(false),
        error: () => this.saving.set(false),
      });
  }

  addItem(): void {
    const name = this.newName().trim();
    const url  = this.newUrl().trim();
    if (!name || !url || this.adding()) return;
    this.adding.set(true);
    this.api.addCustomTrailerItem({ name, youtube_url: url }).subscribe({
      next: item => {
        this.items.update(list => [...list, item]);
        this.newName.set('');
        this.newUrl.set('');
        this.adding.set(false);
      },
      error: () => this.adding.set(false),
    });
  }

  removeItem(id: number): void {
    this.api.deleteCustomTrailerItem(id).subscribe(() =>
      this.items.update(list => list.filter(i => i.id !== id))
    );
  }
}
