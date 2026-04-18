import { Component, computed, inject, OnInit, signal, ChangeDetectionStrategy,
} from '@angular/core';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { AdminApiService } from '../services/admin-api.service';
import { Survey, SurveyResults } from '../models/admin.models';
import { DialogComponent } from '../../../shared/components/dialog/dialog.component';

type LangRecord = Record<string, string>;

interface SurveyForm {
  title:     LangRecord;
  question:  LangRecord;
  starts_at: string;
  ends_at:   string;
  options:   LangRecord[];
}

@Component({
  selector: 'app-admin-surveys',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoModule, DialogComponent],
  templateUrl: './admin-surveys.component.html',
  styleUrl: './admin-surveys.component.css',
})
export class AdminSurveysComponent implements OnInit {
  private readonly api       = inject(AdminApiService);
  private readonly transloco = inject(TranslocoService);

  readonly LANGS = ['es', 'en', 'fr', 'pt', 'it'];

  readonly surveys      = signal<Survey[]>([]);
  readonly editOpen     = signal(false);
  readonly deleteOpen   = signal(false);
  readonly resultsOpen  = signal(false);
  readonly saving       = signal(false);
  readonly target       = signal<Survey | null>(null);
  readonly results      = signal<SurveyResults | null>(null);
  readonly activeLang   = signal('es');

  readonly form = signal<SurveyForm>(this.emptyForm());

  readonly canSave = computed(() => {
    const f = this.form();
    return this.LANGS.every(lang =>
      f.title[lang]?.trim() &&
      f.question[lang]?.trim() &&
      f.options.every(o => o[lang]?.trim())
    );
  });

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.api.getSurveys().subscribe(s => this.surveys.set(s));
  }

  private emptyForm(): SurveyForm {
    const empty = Object.fromEntries(this.LANGS.map(l => [l, '']));
    return {
      title:     { ...empty },
      question:  { ...empty },
      starts_at: '',
      ends_at:   '',
      options:   [{ ...empty }, { ...empty }],
    };
  }

  openCreate(): void {
    this.target.set(null);
    this.activeLang.set('es');
    this.form.set(this.emptyForm());
    this.editOpen.set(true);
  }

  openEdit(survey: Survey): void {
    this.target.set(survey);
    this.activeLang.set('es');
    this.api.getSurvey(survey.id).subscribe(s => {
      const empty = Object.fromEntries(this.LANGS.map(l => [l, '']));
      this.form.set({
        title:     { ...empty, ...s.title },
        question:  { ...empty, ...s.question },
        starts_at: this.utcToLocal(s.starts_at),
        ends_at:   this.utcToLocal(s.ends_at),
        options:   s.options?.map(o => ({ ...empty, ...o.text })) ?? [{ ...empty }, { ...empty }],
      });
      this.editOpen.set(true);
    });
  }

  openResults(survey: Survey): void {
    this.target.set(survey);
    this.results.set(null);
    this.resultsOpen.set(true);
    this.api.getSurveyResults(survey.id).subscribe(r => this.results.set(r));
  }

  openDelete(survey: Survey): void {
    this.target.set(survey);
    this.deleteOpen.set(true);
  }

  setField(key: 'starts_at' | 'ends_at', value: string): void {
    this.form.update(f => ({ ...f, [key]: value }));
  }

  setTitle(lang: string, value: string): void {
    this.form.update(f => ({ ...f, title: { ...f.title, [lang]: value } }));
  }

  setQuestion(lang: string, value: string): void {
    this.form.update(f => ({ ...f, question: { ...f.question, [lang]: value } }));
  }

  setOption(index: number, lang: string, value: string): void {
    this.form.update(f => {
      const options = f.options.map((o, i) => i === index ? { ...o, [lang]: value } : o);
      return { ...f, options };
    });
  }

  addOption(): void {
    const empty = Object.fromEntries(this.LANGS.map(l => [l, '']));
    this.form.update(f => ({ ...f, options: [...f.options, { ...empty }] }));
  }

  removeOption(index: number): void {
    this.form.update(f => ({ ...f, options: f.options.filter((_, i) => i !== index) }));
  }

  isLangComplete(lang: string): boolean {
    const f = this.form();
    return !!(f.title[lang]?.trim() && f.question[lang]?.trim() && f.options.every(o => o[lang]?.trim()));
  }

  titleFor(title: LangRecord): string {
    const lang = this.transloco.getActiveLang();
    return title[lang] || title['es'] || Object.values(title)[0] || '';
  }

  utcToLocal(dt: string): string {
    if (!dt) return dt;
    const d = new Date(dt.replace(' ', 'T') + 'Z');
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().slice(0, 16);
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
      question:  f.question,
      starts_at: this.localToUTC(f.starts_at),
      ends_at:   this.localToUTC(f.ends_at),
      options:   f.options,
    };
    const req = this.target()
      ? this.api.updateSurvey(this.target()!.id, payload)
      : this.api.createSurvey(payload);

    req.subscribe({
      next:  () => { this.saving.set(false); this.editOpen.set(false); this.load(); },
      error: () => this.saving.set(false),
    });
  }

  confirmDelete(): void {
    const t = this.target();
    if (!t) return;
    this.api.deleteSurvey(t.id).subscribe(() => {
      this.deleteOpen.set(false);
      this.surveys.update(list => list.filter(s => s.id !== t.id));
    });
  }

  statusClass(status: string | undefined): string {
    const map: Record<string, string> = {
      active:                'active',
      upcoming:              'upcoming',
      ended:                 'ended',
      missing_translations:  'missing',
    };
    return map[status ?? ''] ?? 'upcoming';
  }
}
