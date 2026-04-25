import {
  AfterViewInit, ChangeDetectionStrategy, Component, DestroyRef,
  ElementRef, EventEmitter, inject, Input, OnInit, Output, signal, ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ApiService } from '../../../core/services/api.service';
import { ReviewShareData } from '../../../core/models/product.model';

type LayoutKey = 'cover-left' | 'cover-right' | 'minimalist';
type ChartKey  = 'radar' | 'bar-h' | 'bar-v';
type BgTypeKey = 'solid' | 'image' | 'cover' | 'upload';
type FormatKey = 'square' | 'stories' | 'banner';

@Component({
  selector: 'app-review-share',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [TranslocoModule],
  templateUrl: './review-share.component.html',
  styleUrl: './review-share.component.css',
})
export class ReviewShareComponent implements OnInit, AfterViewInit {
  @Input({ required: true }) reviewId!: number;
  @Output() closed = new EventEmitter<void>();
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private readonly api        = inject(ApiService);
  private readonly t          = inject(TranslocoService);
  private readonly destroyRef = inject(DestroyRef);

  data         = signal<ReviewShareData | null>(null);
  loading      = signal(true);
  uploadError  = signal<string | null>(null);

  activeTab = signal<'simple' | 'detailed'>('simple');

  format    = signal<FormatKey>('square');
  layout    = signal<LayoutKey>('cover-left');
  chartType = signal<ChartKey>('radar');
  bgType    = signal<BgTypeKey>('solid');
  bgColor   = signal('#1a1a2e');
  bgUrl     = signal('');

  chartColor        = signal('#6200EE');
  fontColor         = signal('#ffffff');
  infoScale         = signal(1);
  fontOpacity       = signal(1);
  showBody          = signal(true);
  chartLabelColor   = signal('#ffffff');
  chartLabelScale   = signal(1);
  chartLabelOpacity = signal(0.65);
  backdropEnabled   = signal(false);
  backdropColor     = signal('#000000');
  backdropAlpha     = signal(0.45);
  overlayAlpha      = signal(0);
  copySuccess       = signal(false);

  readonly formats: { key: FormatKey; w: number; h: number; labelKey: string }[] = [
    { key: 'square',  w: 1080, h: 1080, labelKey: 'share.format_square'  },
    { key: 'stories', w: 1080, h: 1920, labelKey: 'share.format_stories' },
    { key: 'banner',  w: 1920, h: 1080, labelKey: 'share.format_banner'  },
  ];

  readonly layouts: { key: LayoutKey; labelKey: string }[] = [
    { key: 'cover-left',  labelKey: 'share.layout_cover_left' },
    { key: 'cover-right', labelKey: 'share.layout_cover_right' },
    { key: 'minimalist',  labelKey: 'share.layout_minimalist' },
  ];

  readonly chartTypes: { key: ChartKey; labelKey: string }[] = [
    { key: 'bar-h',  labelKey: 'share.chart_bar_h' },
    { key: 'bar-v',  labelKey: 'share.chart_bar_v' },
    { key: 'radar',  labelKey: 'share.chart_radar' },
  ];

  readonly bgTypes: { key: BgTypeKey; labelKey: string }[] = [
    { key: 'solid',  labelKey: 'share.bg_solid' },
    { key: 'cover',  labelKey: 'share.bg_cover' },
    { key: 'image',  labelKey: 'share.bg_image' },
    { key: 'upload', labelKey: 'share.bg_upload' },
  ];

  readonly themes: { key: string; labelKey: string; bg: string; font: string; chart: string; label: string }[] = [
    { key: 'dark',   labelKey: 'share.theme_dark',   bg: '#0f0f1a', font: '#ffffff', chart: '#6200ee', label: '#ffffff' },
    { key: 'light',  labelKey: 'share.theme_light',  bg: '#f0f0f5', font: '#111111', chart: '#5200cc', label: '#333333' },
    { key: 'amoled', labelKey: 'share.theme_amoled', bg: '#000000', font: '#ffffff', chart: '#bb86fc', label: '#dddddd' },
    { key: 'neon',   labelKey: 'share.theme_neon',   bg: '#050511', font: '#00ffdd', chart: '#ff00aa', label: '#00ffdd' },
  ];

  private coverImg:  HTMLImageElement | null = null;
  private bgImg:     HTMLImageElement | null = null;
  private offCanvas: HTMLCanvasElement | null = null;
  private viewReady = false;
  private rafId = 0;

  private readonly GRADE_COLORS: Record<string, string> = {
    'S':  '#ffffff',
    'A+': '#ffd600', 'A':  '#69f0ae',
    'B+': '#00e5ff', 'B':  '#40c4ff',
    'C+': '#ea80fc', 'C':  '#ffd740',
    'D+': '#ff6e40', 'D':  '#ff9100',
    'E+': '#ff3d00', 'E':  '#ff1744',
    'F':  '#ff5252',
  };

  ngOnInit(): void {
    this.destroyRef.onDestroy(() => {
      this.coverImg  = null;
      this.bgImg     = null;
      this.offCanvas = null;
    });

    this.api.getReviewShareData(this.reviewId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: d => {
          this.data.set(d);
          this.loading.set(false);
          if (d.product.cover_image) {
            this.loadImage(this.igdbHiRes(d.product.cover_image))
              .then(img => { this.coverImg = img; this.redraw(); })
              .catch(() => this.redraw());
          } else {
            this.redraw();
          }
        },
        error: () => this.loading.set(false),
      });
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    if (this.data()) this.redraw();
  }

  setFormat(k: FormatKey): void {
    this.format.set(k);
    const fmt = this.formats.find(f => f.key === k)!;
    const canvas = this.canvasRef.nativeElement;
    canvas.width  = fmt.w;
    canvas.height = fmt.h;
    this.redraw();
  }

  applyTheme(t: typeof this.themes[0]): void {
    this.bgType.set('solid');
    this.bgColor.set(t.bg);
    this.fontColor.set(t.font);
    this.chartColor.set(t.chart);
    this.chartLabelColor.set(t.label);
    this.redraw();
  }

  copyToClipboard(): void {
    if (typeof ClipboardItem === 'undefined') { this.download(); return; }
    try {
      this.canvasRef.nativeElement.toBlob(async blob => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          this.copySuccess.set(true);
          setTimeout(() => this.copySuccess.set(false), 2000);
        } catch { this.download(); }
      }, 'image/png');
    } catch { this.download(); }
  }

  shareImage(): void {
    const d = this.data();
    if (!d) return;
    try {
      this.canvasRef.nativeElement.toBlob(async blob => {
        if (!blob) return;
        const filename = `vouch-${d.product.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png`;
        const file = new File([blob], filename, { type: 'image/png' });
        if (!('share' in navigator) || !navigator.canShare({ files: [file] })) { this.download(); return; }
        try { await navigator.share({ files: [file], title: d.product.title }); } catch { /* cancelled */ }
      }, 'image/png');
    } catch { this.download(); }
  }

  setLayout(k: LayoutKey): void   { this.layout.set(k);    this.redraw(); }
  setChartType(k: ChartKey): void { this.chartType.set(k); this.redraw(); }

  setBgType(k: BgTypeKey): void {
    this.bgType.set(k);
    if (k !== 'image') this.bgUrl.set('');
    if (k !== 'image' && k !== 'upload') this.bgImg = null;
    this.redraw();
  }

  onBgColorChange(e: Event):          void { this.bgColor.set((e.target as HTMLInputElement).value);          this.scheduleRedraw(); }
  onChartColorChange(e: Event):       void { this.chartColor.set((e.target as HTMLInputElement).value);       this.scheduleRedraw(); }
  onFontColorChange(e: Event):        void { this.fontColor.set((e.target as HTMLInputElement).value);        this.scheduleRedraw(); }
  onChartLabelColorChange(e: Event):  void { this.chartLabelColor.set((e.target as HTMLInputElement).value);  this.scheduleRedraw(); }
  onOverlayAlphaChange(e: Event):     void { this.overlayAlpha.set(+(e.target as HTMLInputElement).value / 100); this.scheduleRedraw(); }

  onInfoScaleChange(e: Event): void {
    const v = +(e.target as HTMLInputElement).value;
    if (v > 0) { this.infoScale.set(v); this.redraw(); }
  }

  onFontOpacityChange(e: Event): void {
    this.fontOpacity.set(+(e.target as HTMLInputElement).value / 100);
    this.scheduleRedraw();
  }

  onChartLabelScaleChange(e: Event): void {
    const v = +(e.target as HTMLInputElement).value;
    if (v > 0) { this.chartLabelScale.set(v); this.redraw(); }
  }

  onChartLabelOpacityChange(e: Event): void {
    this.chartLabelOpacity.set(+(e.target as HTMLInputElement).value / 100);
    this.scheduleRedraw();
  }

  onBackdropColorChange(e: Event): void {
    this.backdropColor.set((e.target as HTMLInputElement).value);
    this.scheduleRedraw();
  }

  onBackdropAlphaChange(e: Event): void {
    this.backdropAlpha.set(+(e.target as HTMLInputElement).value / 100);
    this.scheduleRedraw();
  }

  toggleBackdrop(): void {
    this.backdropEnabled.set(!this.backdropEnabled());
    this.redraw();
  }

  onBgUrlChange(e: Event): void {
    const url = (e.target as HTMLInputElement).value.trim();
    this.bgUrl.set(url);
    if (!url) { this.bgImg = null; this.redraw(); return; }
    this.loadImage(url)
      .then(img => { this.bgImg = img; this.redraw(); })
      .catch(() => { this.bgImg = null; this.redraw(); });
  }

  onFileUpload(e: Event): void {
    const input = e.target as HTMLInputElement;
    const file  = input.files?.[0];
    input.value = '';
    if (!file) return;

    const VALID = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    if (!VALID.includes(file.type)) {
      this.uploadError.set('share.upload_invalid_type');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.uploadError.set('share.upload_too_large');
      return;
    }

    this.uploadError.set(null);
    const reader = new FileReader();
    reader.onload = ev => {
      this.loadImage(ev.target!.result as string)
        .then(img => { this.bgImg = img; this.bgType.set('upload'); this.redraw(); })
        .catch(() => this.uploadError.set('share.upload_invalid_type'));
    };
    reader.readAsDataURL(file);
  }

  download(): void {
    const d = this.data();
    if (!d) return;
    try {
      const a = document.createElement('a');
      a.download = `vouch-${d.product.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png`;
      a.href = this.canvasRef.nativeElement.toDataURL('image/png');
      a.click();
    } catch { /* tainted canvas */ }
  }

  onOverlayClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('share-overlay')) this.closed.emit();
  }

  private igdbHiRes(url: string): string {
    if (!url.includes('images.igdb.com')) return url;
    return url.replace(/\/t_[^/]+\//, '/t_1080p/');
  }

  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload  = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  redraw(): void {
    if (!this.viewReady || !this.data()) return;
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    this.drawCanvas(ctx, canvas.width, canvas.height, this.data()!);
  }

  private scheduleRedraw(): void {
    cancelAnimationFrame(this.rafId);
    this.rafId = requestAnimationFrame(() => this.redraw());
  }

  // ─── Main draw ─────────────────────────────────────────────────

  private drawCanvas(ctx: CanvasRenderingContext2D, W: number, H: number, d: ReviewShareData): void {
    ctx.clearRect(0, 0, W, H);
    this.drawBackground(ctx, W, H);
    const lang  = this.t.getActiveLang();
    const grade = d.review.letter_grade;
    switch (this.layout()) {
      case 'cover-left':  this.drawSideLayout(ctx, W, H, d, lang, grade, 'left');  break;
      case 'cover-right': this.drawSideLayout(ctx, W, H, d, lang, grade, 'right'); break;
      case 'minimalist':  this.drawMinimalistLayout(ctx, W, H, d, lang, grade);    break;
    }
    this.drawWatermark(ctx, W, H);
  }

  private drawBackground(ctx: CanvasRenderingContext2D, W: number, H: number): void {
    ctx.save();
    const bg = this.bgType();
    if (bg === 'cover' && this.coverImg) {
      this.drawImageFill(ctx, this.coverImg, 0, 0, W, H);
      if (this.overlayAlpha() > 0) {
        ctx.fillStyle = `rgba(0,0,0,${this.overlayAlpha()})`;
        ctx.fillRect(0, 0, W, H);
      }
    } else if ((bg === 'image' || bg === 'upload') && this.bgImg) {
      this.drawImageFill(ctx, this.bgImg, 0, 0, W, H);
      if (this.overlayAlpha() > 0) {
        ctx.fillStyle = `rgba(0,0,0,${this.overlayAlpha()})`;
        ctx.fillRect(0, 0, W, H);
      }
    } else {
      ctx.fillStyle = this.bgColor();
      ctx.fillRect(0, 0, W, H);
    }
    ctx.restore();
  }

  // ─── Layouts ───────────────────────────────────────────────────

  private drawSideLayout(
    ctx: CanvasRenderingContext2D, W: number, H: number,
    d: ReviewShareData, lang: string, grade: string, side: 'left' | 'right'
  ): void {
    const pH = H / 1080;
    const pW = W / 1080;

    const coverW   = Math.round(420 * pW);
    const coverX   = side === 'left' ? 0 : W - coverW;
    const infoX    = side === 'left' ? Math.round(470 * pW) : Math.round(50 * pW);
    const infoW    = W - coverW - Math.round(100 * pW);
    const overlapW = Math.round(W * 0.05);

    if (this.coverImg) {
      const img    = this.coverImg;
      const aspect = img.naturalWidth / img.naturalHeight;
      const cW     = H * aspect;
      const cX     = side === 'left' ? 0 : W - cW;

      if (!this.offCanvas) this.offCanvas = document.createElement('canvas');
      const off    = this.offCanvas;
      off.width    = W;
      off.height   = H;
      const offCtx = off.getContext('2d')!;
      offCtx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, cX, 0, cW, H);

      if (this.format() !== 'banner') {
        const fadeStart = side === 'left' ? infoX - overlapW : infoX + infoW;
        const fadeEnd   = side === 'left' ? infoX             : infoX + infoW + overlapW;
        const fade      = offCtx.createLinearGradient(fadeStart, 0, fadeEnd, 0);
        fade.addColorStop(0, side === 'left' ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,1)');
        fade.addColorStop(1, side === 'left' ? 'rgba(0,0,0,1)' : 'rgba(0,0,0,0)');
        offCtx.globalCompositeOperation = 'destination-out';
        offCtx.fillStyle = fade;
        offCtx.fillRect(0, 0, W, H);
      }

      ctx.drawImage(off, 0, 0);
    } else {
      this.drawCoverPlaceholder(ctx, coverX, 0, coverW, H);
    }

    const s  = this.infoScale();
    const fo = this.fontOpacity();
    const fc = this.fontColor();
    const gc = this.GRADE_COLORS[grade] ?? fc;

    const gradeY = Math.round(190 * pH);
    const titleY = Math.round(330 * pH);

    ctx.save();
    ctx.font = `800 ${130 * s}px system-ui, sans-serif`;
    ctx.fillStyle = this.alphaColor(gc, fo);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(grade, infoX, gradeY);
    ctx.restore();

    ctx.save();
    ctx.font = `700 ${36 * s}px system-ui, sans-serif`;
    ctx.fillStyle = this.alphaColor(fc, fo);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    this.fillWrappedText(ctx, d.product.title, infoX, titleY, infoW, 52 * s, 2);
    ctx.restore();

    let contentY = titleY + 2 * (52 * s) + Math.round(20 * pH);
    if (this.showBody() && d.review.body) {
      ctx.save();
      ctx.font = `400 ${22 * s}px system-ui, sans-serif`;
      ctx.fillStyle = this.alphaColor(fc, 0.72 * fo);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      this.fillWrappedText(ctx, d.review.body, infoX, contentY, infoW, 32 * s, 3);
      ctx.restore();
      contentY += 3 * (32 * s) + Math.round(20 * pH);
    }

    const chartY = Math.max(contentY, Math.round(440 * pH));
    const authorY = H - Math.round(50 * pH);
    const chartH  = authorY - chartY - Math.round(20 * pH);

    if (this.backdropEnabled()) this.drawBackdrop(ctx, infoX, chartY, infoW, chartH);
    this.drawChart(ctx, d.scores, infoX, chartY, infoW, chartH, lang);

    ctx.save();
    ctx.font = `500 ${26 * s}px system-ui, sans-serif`;
    ctx.fillStyle = this.alphaColor(fc, 0.55 * fo);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(d.user.name, infoX, authorY);
    ctx.restore();
  }

  private drawCoverPlaceholder(
    ctx: CanvasRenderingContext2D,
    x: number, y: number, w: number, h: number
  ): void {
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.fillRect(x, y, w, h);
    ctx.restore();
  }

  private drawMinimalistLayout(
    ctx: CanvasRenderingContext2D, W: number, H: number,
    d: ReviewShareData, lang: string, grade: string
  ): void {
    const pH = H / 1080;
    const pad = Math.round(80 * (W / 1080));
    const s   = this.infoScale();
    const fo  = this.fontOpacity();
    const fc  = this.fontColor();
    const gc  = this.GRADE_COLORS[grade] ?? fc;

    const gradeY = Math.round(200 * pH);
    const titleY = Math.round(310 * pH);

    ctx.save();
    ctx.font = `800 ${160 * s}px system-ui, sans-serif`;
    ctx.fillStyle = this.alphaColor(gc, fo);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(grade, W / 2, gradeY);
    ctx.restore();

    ctx.save();
    ctx.font = `700 ${40 * s}px system-ui, sans-serif`;
    ctx.fillStyle = this.alphaColor(fc, fo);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    this.fillWrappedTextCentered(ctx, d.product.title, W / 2, titleY, W - pad * 2, 56 * s, 2);
    ctx.restore();

    let contentY = titleY + 2 * (56 * s) + Math.round(20 * pH);
    if (this.showBody() && d.review.body) {
      ctx.save();
      ctx.font = `400 ${24 * s}px system-ui, sans-serif`;
      ctx.fillStyle = this.alphaColor(fc, 0.72 * fo);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      this.fillWrappedTextCentered(ctx, d.review.body, W / 2, contentY, W - pad * 2, 34 * s, 3);
      ctx.restore();
      contentY += 3 * (34 * s) + Math.round(20 * pH);
    }

    const authorY = H - Math.round(48 * pH);
    const chartY  = Math.max(contentY, Math.round(420 * pH));
    const chartH  = authorY - chartY - Math.round(20 * pH);

    if (this.backdropEnabled()) this.drawBackdrop(ctx, pad, chartY, W - pad * 2, chartH);
    this.drawChart(ctx, d.scores, pad, chartY, W - pad * 2, chartH, lang);

    ctx.save();
    ctx.font = `500 ${26 * s}px system-ui, sans-serif`;
    ctx.fillStyle = this.alphaColor(fc, 0.55 * fo);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(d.user.name, pad, authorY);
    ctx.restore();
  }

  // ─── Chart dispatch ────────────────────────────────────────────

  private drawChart(
    ctx: CanvasRenderingContext2D,
    scores: ReviewShareData['scores'],
    x: number, y: number, w: number, h: number, lang: string
  ): void {
    if (!scores.length) return;
    switch (this.chartType()) {
      case 'bar-h': this.drawHBars(ctx, scores, x, y, w, h, lang);                                     break;
      case 'bar-v': this.drawVBars(ctx, scores, x, y, w, h, lang);                                     break;
      case 'radar': this.drawRadar(ctx, scores, x + w / 2, y + h / 2, Math.min(w, h) / 2 - 40, lang); break;
    }
  }

  private drawBackdrop(
    ctx: CanvasRenderingContext2D,
    x: number, y: number, w: number, h: number
  ): void {
    const { r, g, b } = this.hexToRgb(this.backdropColor());
    ctx.save();
    ctx.fillStyle = `rgba(${r},${g},${b},${this.backdropAlpha()})`;
    ctx.beginPath();
    ctx.roundRect(x - 20, y - 20, w + 40, h + 40, 16);
    ctx.fill();
    ctx.restore();
  }

  // ─── Charts ────────────────────────────────────────────────────

  private drawHBars(
    ctx: CanvasRenderingContext2D,
    scores: ReviewShareData['scores'],
    x: number, y: number, w: number, h: number, lang: string
  ): void {
    const clc      = this.chartLabelColor();
    const cls      = this.chartLabelScale();
    const clo      = this.chartLabelOpacity();
    const cc       = this.chartColor();
    const n        = scores.length;
    const rowH     = Math.min(h / n, 72);
    const labelW   = 200;
    const barAreaW = w - labelW - 14;
    const barH     = rowH * 0.42;

    scores.forEach((s, i) => {
      const barY  = y + i * rowH + (rowH - barH) / 2;
      const label = s.name[lang] ?? s.name['en'] ?? Object.values(s.name)[0] ?? '';

      ctx.save();
      ctx.font = `500 ${22 * cls}px system-ui, sans-serif`;
      ctx.fillStyle = this.alphaColor(clc, clo);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.truncate(label, 18), x + labelW, barY + barH / 2);
      ctx.restore();

      ctx.save();
      ctx.fillStyle = this.alphaColor(clc, 0.07);
      ctx.beginPath();
      ctx.roundRect(x + labelW + 14, barY, barAreaW, barH, 4);
      ctx.fill();
      ctx.restore();

      const fillW = (s.score / 10) * barAreaW;
      if (fillW > 0) {
        ctx.save();
        ctx.fillStyle = cc;
        ctx.beginPath();
        ctx.roundRect(x + labelW + 14, barY, fillW, barH, 4);
        ctx.fill();
        ctx.restore();
      }
    });
  }

  private drawVBars(
    ctx: CanvasRenderingContext2D,
    scores: ReviewShareData['scores'],
    x: number, y: number, w: number, h: number, lang: string
  ): void {
    const clc     = this.chartLabelColor();
    const cls     = this.chartLabelScale();
    const clo     = this.chartLabelOpacity();
    const cc      = this.chartColor();
    const n       = scores.length;
    const gapW    = w / n;
    const barW    = Math.min(gapW * 0.6, 60);
    const labelH  = 80;
    const maxBarH = h - labelH - 30;

    scores.forEach((s, i) => {
      const cx   = x + i * gapW + gapW / 2;
      const bH   = (s.score / 10) * maxBarH;
      const barX = cx - barW / 2;
      const barY = y + maxBarH - bH;

      ctx.save();
      ctx.fillStyle = this.alphaColor(clc, 0.07);
      ctx.beginPath();
      ctx.roundRect(barX, y, barW, maxBarH, 4);
      ctx.fill();
      ctx.restore();

      if (bH > 0) {
        ctx.save();
        ctx.fillStyle = cc;
        ctx.beginPath();
        ctx.roundRect(barX, barY, barW, bH, 4);
        ctx.fill();
        ctx.restore();
      }

      const label = s.name[lang] ?? s.name['en'] ?? Object.values(s.name)[0] ?? '';
      ctx.save();
      ctx.translate(cx, y + maxBarH + 14);
      ctx.rotate(-Math.PI / 4);
      ctx.font = `500 ${18 * cls}px system-ui, sans-serif`;
      ctx.fillStyle = this.alphaColor(clc, clo);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.truncate(label, 14), 0, 0);
      ctx.restore();
    });
  }

  private drawRadar(
    ctx: CanvasRenderingContext2D,
    scores: ReviewShareData['scores'],
    cx: number, cy: number, r: number, lang: string
  ): void {
    const clc   = this.chartLabelColor();
    const cls   = this.chartLabelScale();
    const clo   = this.chartLabelOpacity();
    const cc    = this.chartColor();
    const n     = scores.length;
    const step  = (Math.PI * 2) / n;
    const start = -Math.PI / 2;

    for (let ring = 1; ring <= 5; ring++) {
      const rr = r * (ring / 5);
      ctx.save();
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const a = start + i * step;
        const px = cx + rr * Math.cos(a), py = cy + rr * Math.sin(a);
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.strokeStyle = this.alphaColor(clc, 0.1);
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }

    for (let i = 0; i < n; i++) {
      const a = start + i * step;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
      ctx.strokeStyle = this.alphaColor(clc, 0.1);
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }

    const { r: cr, g: cg, b: cb } = this.hexToRgb(cc);
    ctx.save();
    ctx.beginPath();
    scores.forEach((s, i) => {
      const a  = start + i * step;
      const rr = r * (s.score / 10);
      const px = cx + rr * Math.cos(a), py = cy + rr * Math.sin(a);
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.fillStyle   = `rgba(${cr},${cg},${cb},0.4)`;
    ctx.strokeStyle = cc;
    ctx.lineWidth   = 2.5;
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    scores.forEach((s, i) => {
      const a     = start + i * step;
      const lx = cx + (r + 38) * Math.cos(a);
      const ly = cy + (r + 38) * Math.sin(a);
      const label = s.name[lang] ?? s.name['en'] ?? Object.values(s.name)[0] ?? '';

      ctx.save();
      ctx.font = `500 ${18 * cls}px system-ui, sans-serif`;
      ctx.fillStyle    = this.alphaColor(clc, clo);
      ctx.textAlign    = lx < cx - 5 ? 'right' : lx > cx + 5 ? 'left' : 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.truncate(label, 14), lx, ly);
      ctx.restore();

      const dotR = r * (s.score / 10);
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx + dotR * Math.cos(a), cy + dotR * Math.sin(a), 5, 0, Math.PI * 2);
      ctx.fillStyle = cc;
      ctx.fill();
      ctx.restore();
    });
  }

  // ─── Helpers ───────────────────────────────────────────────────

  private drawWatermark(ctx: CanvasRenderingContext2D, W: number, H: number): void {
    ctx.save();
    ctx.font = '800 22px system-ui, sans-serif';
    ctx.fillStyle = this.alphaColor(this.fontColor(), 0.18 * this.fontOpacity());
    ctx.textAlign    = 'right';
    ctx.textBaseline = 'bottom';
    ctx.letterSpacing = '4px';
    ctx.fillText('VOUCH', W - 36, H - 36);
    ctx.restore();
  }

  private drawImageFill(
    ctx: CanvasRenderingContext2D, img: HTMLImageElement,
    x: number, y: number, w: number, h: number
  ): void {
    const sa = img.naturalWidth / img.naturalHeight;
    const da = w / h;
    let sx: number, sy: number, sw: number, sh: number;
    if (sa > da) { sh = img.naturalHeight; sw = sh * da; sx = (img.naturalWidth - sw) / 2; sy = 0; }
    else         { sw = img.naturalWidth;  sh = sw / da; sx = 0; sy = (img.naturalHeight - sh) / 2; }
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  }

  private fillWrappedText(
    ctx: CanvasRenderingContext2D, text: string,
    x: number, y: number, maxW: number, lineH: number, maxLines: number
  ): void {
    const words = text.split(' ');
    let line = '', lineIdx = 0;
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line, x, y + lineIdx * lineH);
        lineIdx++;
        if (lineIdx >= maxLines) {
          let rem = words.slice(words.indexOf(word)).join(' ');
          while (ctx.measureText(rem + '…').width > maxW && rem.length) rem = rem.slice(0, -1);
          ctx.fillText(rem + '…', x, y + lineIdx * lineH);
          return;
        }
        line = word;
      } else { line = test; }
    }
    if (line) ctx.fillText(line, x, y + lineIdx * lineH);
  }

  private fillWrappedTextCentered(
    ctx: CanvasRenderingContext2D, text: string,
    cx: number, y: number, maxW: number, lineH: number, maxLines: number
  ): void {
    const words = text.split(' ');
    let line = '', lineIdx = 0;
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line, cx, y + lineIdx * lineH);
        lineIdx++;
        if (lineIdx >= maxLines) {
          let rem = words.slice(words.indexOf(word)).join(' ');
          while (ctx.measureText(rem + '…').width > maxW && rem.length) rem = rem.slice(0, -1);
          ctx.fillText(rem + '…', cx, y + lineIdx * lineH);
          return;
        }
        line = word;
      } else { line = test; }
    }
    if (line) ctx.fillText(line, cx, y + lineIdx * lineH);
  }

  private truncate(text: string, maxLen: number): string {
    return text.length > maxLen ? text.slice(0, maxLen - 1) + '…' : text;
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    if (!/^#[0-9a-f]{6}$/i.test(hex)) return { r: 0, g: 0, b: 0 };
    return {
      r: parseInt(hex.slice(1, 3), 16),
      g: parseInt(hex.slice(3, 5), 16),
      b: parseInt(hex.slice(5, 7), 16),
    };
  }

  private alphaColor(hex: string, alpha: number): string {
    if (hex.startsWith('rgba') || hex.startsWith('rgb')) return hex;
    const { r, g, b } = this.hexToRgb(hex);
    return `rgba(${r},${g},${b},${alpha})`;
  }
}
