import { Component, inject, OnInit, signal, ChangeDetectionStrategy,
} from '@angular/core';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { AdminApiService } from '../services/admin-api.service';
import { Genre, IgdbGame, PlatformWithPivot, Product } from '../models/admin.models';
import { DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { LocalizedNamePipe } from '../../../shared/pipes/localized-name.pipe';
import { IgdbCoverPipe } from '../../../shared/pipes/igdb-cover.pipe';
import { AdminTableBase } from '../admin-table.base';

@Component({
  selector: 'app-admin-products',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoModule, DialogComponent, LocalizedNamePipe, IgdbCoverPipe],
  templateUrl: './admin-products.component.html',
  styleUrl: './admin-products.component.css',
})
export class AdminProductsComponent extends AdminTableBase<Product> implements OnInit {
  private api = inject(AdminApiService);
  private t   = inject(TranslocoService);

  override sortBy = signal('title');

  genres        = signal<Genre[]>([]);
  filterType    = signal('');
  filterGenreId = signal(0);

  formDialogOpen  = signal(false);
  formDialogTitle = signal('');
  editingId       = signal<number | null>(null);
  form = signal({
    type: 'game' as 'game' | 'movie' | 'series',
    genre_ids: [] as number[],
    title: '',
    description: '',
    cover_image: '',
    developer: '',
    publisher: '',
  });

  igdbDialogOpen = signal(false);
  igdbQuery      = signal('');
  igdbResults    = signal<IgdbGame[]>([]);

  linksDialogOpen  = signal(false);
  linksDialogTitle = signal('');
  linksProductId   = signal<number | null>(null);
  linksPlatforms   = signal<{ id: number; name: string; url: string }[]>([]);

  ngOnInit(): void {
    this.load();
    this.api.getAllGenres().subscribe(g => this.genres.set(g));
  }

  load(p = 1): void {
    const params: Record<string, string> = {
      page: String(p),
      per_page: String(this.perPage()),
      sort_by: this.sortBy(),
      sort_dir: this.sortDir(),
    };
    if (this.filterSearch()) params['search'] = this.filterSearch();
    if (this.filterType()) params['type'] = this.filterType();
    if (this.filterGenreId()) params['genre_id'] = String(this.filterGenreId());
    this.api.getProducts(params).subscribe(data => this.page.set(data));
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.set({ type: 'game', genre_ids: [], title: '', description: '', cover_image: '', developer: '', publisher: '' });
    this.formDialogTitle.set(this.t.translate('admin.products.new_title'));
    this.formDialogOpen.set(true);
  }

  openEdit(item: Product): void {
    this.editingId.set(item.id);
    this.form.set({
      type: item.type,
      genre_ids: item.genres?.map(g => g.id) ?? [],
      title: item.title,
      description: item.description ?? '',
      cover_image: item.cover_image ?? '',
      developer: item.game_details?.developer ?? '',
      publisher: item.game_details?.publisher ?? '',
    });
    this.formDialogTitle.set(this.t.translate('admin.products.edit_title', { name: item.title }));
    this.formDialogOpen.set(true);
  }

  save(): void {
    const id = this.editingId();
    const req = id
      ? this.api.updateProduct(id, this.form())
      : this.api.createProduct(this.form());
    req.subscribe(() => { this.formDialogOpen.set(false); this.load(this.page()?.current_page ?? 1); });
  }

  closeFormDialog(): void { this.formDialogOpen.set(false); }

  delete(item: Product): void {
    this.openConfirm(
      this.t.translate('admin.products.delete_title', { name: item.title }),
      this.t.translate('admin.products.delete_subtitle'),
      () => this.api.deleteProduct(item.id).subscribe(() => this.load(this.page()?.current_page ?? 1))
    );
  }

  openIgdb(): void {
    this.igdbQuery.set('');
    this.igdbResults.set([]);
    this.igdbDialogOpen.set(true);
  }

  searchIgdb(): void {
    if (!this.igdbQuery()) return;
    this.api.searchIgdb(this.igdbQuery()).subscribe(r => this.igdbResults.set(r));
  }

  importIgdb(igdbId: number): void {
    this.api.importFromIgdb(igdbId).subscribe(() => {
      this.igdbDialogOpen.set(false);
      this.load(1);
    });
  }

  closeIgdbDialog(): void { this.igdbDialogOpen.set(false); }

  toggleGenre(id: number, checked: boolean): void {
    this.form.update(f => ({
      ...f,
      genre_ids: checked ? [...f.genre_ids, id] : f.genre_ids.filter(g => g !== id),
    }));
  }

  genreNames(product: Product): string {
    const lang = this.t.getActiveLang();
    return product.genres?.map(g => g.name[lang] || g.name['en']).join(', ') || '—';
  }

  openLinks(product: Product): void {
    this.linksProductId.set(product.id);
    this.linksDialogTitle.set(this.t.translate('admin.products.links_title', { name: product.title }));
    this.linksPlatforms.set(
      (product.platforms ?? []).map((p: PlatformWithPivot) => ({
        id: p.id,
        name: p.name,
        url: p.pivot?.purchase_url ?? '',
      }))
    );
    this.linksDialogOpen.set(true);
  }

  updateLinkUrl(index: number, url: string): void {
    const list = [...this.linksPlatforms()];
    list[index] = { ...list[index], url };
    this.linksPlatforms.set(list);
  }

  saveLinks(): void {
    const id = this.linksProductId()!;
    const platforms = this.linksPlatforms().map(p => ({
      platform_id:  p.id,
      purchase_url: p.url.trim() || null,
    }));
    this.api.updatePurchaseLinks(id, platforms).subscribe(() => {
      this.linksDialogOpen.set(false);
      this.load(this.page()?.current_page ?? 1);
    });
  }

  closeLinksDialog(): void { this.linksDialogOpen.set(false); }

  updateForm(field: string, value: unknown): void {
    this.form.update(f => ({ ...f, [field]: value }));
  }

  coverOf(g: IgdbGame): string {
    return g.cover ? 'https:' + g.cover.url.replace('t_thumb', 't_cover_small') : '';
  }
}
