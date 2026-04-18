import { Component, computed, inject, OnInit, signal, ChangeDetectionStrategy,
} from '@angular/core';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { AdminApiService } from '../services/admin-api.service';
import { Announcement } from '../models/admin.models';
import { DialogComponent } from '../../../shared/components/dialog/dialog.component';

type LangRecord = Record<string, string>;

interface AnnouncementForm {
  title:     LangRecord;
  body:      LangRecord;
  starts_at: string;
  ends_at:   string;
}

@Component({
  selector: 'app-admin-announcements',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoModule, DialogComponent],
  templateUrl: './admin-announcements.component.html',
  styleUrl: './admin-announcements.component.css',
})
export class AdminAnnouncementsComponent implements OnInit {
  private readonly api       = inject(AdminApiService);
  private readonly transloco = inject(TranslocoService);

  readonly LANGS = ['es', 'en', 'fr', 'pt', 'it'];

  readonly announcements = signal<Announcement[]>([]);
  readonly editOpen      = signal(false);
  readonly deleteOpen    = signal(false);
  readonly saving        = signal(false);
  readonly target        = signal<Announcement | null>(null);
  readonly activeLang    = signal('es');

  readonly form = signal<AnnouncementForm>(this.emptyForm());

  readonly canSave = computed(() => {
    const f = this.form();
    return this.LANGS.every(lang =>
      f.title[lang]?.trim() && f.body[lang]?.trim()
    );
  });

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.api.getAnnouncements().subscribe(a => this.announcements.set(a));
  }

  private emptyForm(): AnnouncementForm {
    const empty = Object.fromEntries(this.LANGS.map(l => [l, '']));
    return { title: { ...empty }, body: { ...empty }, starts_at: '', ends_at: '' };
  }

  openCreate(): void {
    this.target.set(null);
    this.activeLang.set('es');
    this.form.set(this.emptyForm());
    this.editOpen.set(true);
  }

  openEdit(a: Announcement): void {
    this.target.set(a);
    this.activeLang.set('es');
    this.api.getAnnouncement(a.id).subscribe(data => {
      const empty = Object.fromEntries(this.LANGS.map(l => [l, '']));
      this.form.set({
        title:     { ...empty, ...data.title },
        body:      { ...empty, ...data.body },
        starts_at: this.utcToLocal(data.starts_at),
        ends_at:   this.utcToLocal(data.ends_at),
      });
      this.editOpen.set(true);
    });
  }

  openDelete(a: Announcement): void {
    this.target.set(a);
    this.deleteOpen.set(true);
  }

  setField(key: 'starts_at' | 'ends_at', value: string): void {
    this.form.update(f => ({ ...f, [key]: value }));
  }

  setTitle(lang: string, value: string): void {
    this.form.update(f => ({ ...f, title: { ...f.title, [lang]: value } }));
  }

  setBody(lang: string, value: string): void {
    this.form.update(f => ({ ...f, body: { ...f.body, [lang]: value } }));
  }

  isLangComplete(lang: string): boolean {
    const f = this.form();
    return !!(f.title[lang]?.trim() && f.body[lang]?.trim());
  }

  titleFor(title: LangRecord): string {
    const lang = this.transloco.getActiveLang();
    return title[lang] || title['es'] || Object.values(title)[0] || '';
  }

  utcToLocal(dt: string): string {
    if (!dt) return dt;
    const d = new Date(dt.replace(' ', 'T') + 'Z');
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  }

  private localToUTC(dt: string): string {
    if (!dt) return dt;
    return new Date(dt).toISOString().slice(0, 16);
  }

  save(): void {
    if (this.saving() || !this.canSave()) return;
    this.saving.set(true);
    const f = this.form();
    const payload = {
      title:     f.title,
      body:      f.body,
      starts_at: this.localToUTC(f.starts_at),
      ends_at:   this.localToUTC(f.ends_at),
    };
    const req = this.target()
      ? this.api.updateAnnouncement(this.target()!.id, payload)
      : this.api.createAnnouncement(payload);

    req.subscribe({
      next:  () => { this.saving.set(false); this.editOpen.set(false); this.load(); },
      error: () => this.saving.set(false),
    });
  }

  confirmDelete(): void {
    const t = this.target();
    if (!t) return;
    this.api.deleteAnnouncement(t.id).subscribe(() => {
      this.deleteOpen.set(false);
      this.announcements.update(list => list.filter(a => a.id !== t.id));
    });
  }

  statusClass(status: string | undefined): string {
    const map: Record<string, string> = {
      active:               'active',
      upcoming:             'upcoming',
      ended:                'ended',
      missing_translations: 'missing',
    };
    return map[status ?? ''] ?? 'upcoming';
  }
}
