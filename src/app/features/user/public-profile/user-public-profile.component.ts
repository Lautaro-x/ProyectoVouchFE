import { Component, computed, inject, OnInit, signal, DOCUMENT, PLATFORM_ID, ChangeDetectionStrategy,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserCardData, SOCIAL_NETWORKS } from '../../../core/models/user.model';
import { UserProfileCardComponent } from '../../../shared/components/user-profile-card/user-profile-card.component';

const GRADE_HEX: Record<string, string> = {
  S: '#ffffff', 'A+': '#ffd600', A: '#69f0ae', 'B+': '#00e5ff', B: '#40c4ff',
  'C+': '#ea80fc', C: '#ffd740', 'D+': '#ff6e40', D: '#ff9100',
  'E+': '#ff3d00', E: '#ff1744', F: '#ff5252',
};

const REVIEW_LADDER   = ['el-critico', 'critico-maestro', 'critico-senior', 'critico-junior', 'critico-novel'];
const FOLLOWER_LADDER = ['critico-influyente', 'critico-famoso', 'critico-fiable', 'critico-solicitado', 'critico-amigo'];

const SOCIAL_SVG: Record<string, string> = Object.fromEntries(
  SOCIAL_NETWORKS.map(n => [n.key, `<svg viewBox="0 0 24 24" fill="#f8fafc"><path d="${n.svgPath}"/></svg>`])
);

@Component({
  selector: 'app-user-public-profile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [TranslocoModule, UserProfileCardComponent],
  templateUrl: './user-public-profile.component.html',
  styleUrl: './user-public-profile.component.css',
})
export class UserPublicProfileComponent implements OnInit {
  private readonly api        = inject(ApiService);
  private readonly auth       = inject(AuthService);
  private readonly doc        = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly sanitizer  = inject(DomSanitizer);
  private readonly t          = inject(TranslocoService);

  readonly loading      = signal(true);
  readonly card         = signal<UserCardData | null>(null);
  readonly savingBg     = signal(false);
  readonly savedBg      = signal(false);
  readonly avatarBroken = signal(false);

  readonly fullBg  = signal('');
  readonly midBg   = signal('');
  readonly miniBg  = signal('');

  readonly copiedBig  = signal(false);
  readonly copiedMid  = signal(false);
  readonly copiedMini = signal(false);

  readonly previewBigCard = computed<UserCardData | null>(() => {
    const c = this.card();
    if (!c) return null;
    return { ...c, card_big_bg: this.fullBg() || null };
  });

  readonly socialEntries = computed(() =>
    Object.entries(this.card()?.social_links ?? {}).filter(([, url]) => !!url)
  );
  readonly summaryReviews = computed(() => this.card()?.last_reviews?.slice(0, 5) ?? []);

  readonly publicProfileUrl = computed(() => {
    const id = this.card()?.id;
    return id ? `${this.doc.location.origin}/u/${id}` : '';
  });

  readonly midSrcdoc = computed((): SafeHtml | null => {
    const c = this.card();
    if (!c) return null;
    return this.sanitizer.bypassSecurityTrustHtml(this.buildCardDoc('mid', c));
  });

  readonly miniSrcdoc = computed((): SafeHtml | null => {
    const c = this.card();
    if (!c) return null;
    return this.sanitizer.bypassSecurityTrustHtml(this.buildCardDoc('mini', c));
  });

  ngOnInit(): void {
    this.api.getUserCardData().subscribe(data => {
      this.card.set(data);
      this.fullBg.set(data.card_big_bg ?? '');
      this.midBg.set(data.card_mid_bg ?? '');
      this.miniBg.set(data.card_mini_bg ?? '');
      this.loading.set(false);
    });
  }

  saveBackgrounds(): void {
    this.savingBg.set(true);
    this.savedBg.set(false);
    this.api.updateProfile({
      card_big_bg:  this.fullBg() || null,
      card_mid_bg:  this.midBg() || null,
      card_mini_bg: this.miniBg() || null,
    }).subscribe(() => {
      this.savingBg.set(false);
      this.savedBg.set(true);
      setTimeout(() => this.savedBg.set(false), 3000);
    });
  }

  copyLink(type: 'big' | 'mid' | 'mini'): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const id = this.card()?.id;
    if (!id) return;
    const url = `${this.doc.location.origin}/card/${type}/${id}`;
    navigator.clipboard.writeText(url).then(() => {
      if (type === 'big')  { this.copiedBig.set(true);  setTimeout(() => this.copiedBig.set(false),  2000); }
      if (type === 'mid')  { this.copiedMid.set(true);  setTimeout(() => this.copiedMid.set(false),  2000); }
      if (type === 'mini') { this.copiedMini.set(true); setTimeout(() => this.copiedMini.set(false), 2000); }
    });
  }

  onAvatarError(): void { this.avatarBroken.set(true); }

  displayBadges(badges: string[]): string[] {
    const result: string[] = [];
    const topReview   = REVIEW_LADDER.find(b => badges.includes(b));
    const topFollower = FOLLOWER_LADDER.find(b => badges.includes(b));
    if (topReview)   result.push(topReview);
    if (topFollower) result.push(topFollower);
    if (badges.includes('critico-rapido')) result.push('critico-rapido');
    return result;
  }

  isVerified(badges: string[]): boolean { return badges.includes('verificado'); }

  private buildCardDoc(type: 'mid' | 'mini', c: UserCardData): string {
    const bg       = type === 'mid' ? this.midBg() : this.miniBg();
    const badges   = this.displayBadges(c.badges ?? []);
    const verified = this.isVerified(c.badges ?? []);
    const social   = Object.entries(c.social_links ?? {}).filter(([, url]) => !!url);
    const reviews  = c.last_reviews?.slice(0, 4) ?? [];
    const igdbCover = (url: string | null | undefined) =>
      url?.includes('images.igdb.com') ? url.replace(/\/t_[^/]+\//, '/t_cover_small/') : (url ?? null);
    const origin   = this.doc.location.origin;
    const tr       = (key: string) => this.t.translate(key);

    const isMid   = type === 'mid';
    const p       = isMid ? 'vsc' : 'vmc';
    const w       = isMid ? '480px' : '360px';
    const h       = isMid ? '480px' : '160px';
    const br      = isMid ? '12px' : '10px';
    const avaSize = isMid ? '100px' : '56px';
    const svgSize = isMid ? '50px' : '28px';
    const iconSz  = isMid ? '18px' : '15px';

    const css = `
      *{box-sizing:border-box;margin:0;padding:0}
      body{background:#020617;display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:'Inter',system-ui,sans-serif}
      .${p}{width:${w};height:${h};position:relative;overflow:hidden;border-radius:${br};display:flex;flex-direction:column;background:#1e293b;color:#f8fafc}
      .${p}-bg{position:absolute;inset:0;background-size:cover;background-position:center;opacity:.25}
      .${p}-header{position:relative;z-index:1;display:flex;align-items:center;gap:${isMid ? '8px' : '6px'};padding:${isMid ? '14px 18px' : '9px 14px'};background:rgba(15,23,42,.75);border-bottom:1px solid rgba(51,65,85,.9);flex-shrink:0}
      .${p}-name{font-size:${isMid ? '16px' : '13px'};font-weight:700;letter-spacing:.02em;display:flex;align-items:center;gap:${isMid ? '5px' : '4px'}}
      .${p}-verified{font-size:${isMid ? '11px' : '9px'};font-weight:800;color:#fbbf24;background:rgba(251,191,36,.15);border:1px solid rgba(251,191,36,.5);border-radius:50%;width:${isMid ? '18px' : '14px'};height:${isMid ? '18px' : '14px'};display:inline-flex;align-items:center;justify-content:center;flex-shrink:0}
      .${p}-badge{font-size:10px;font-weight:700;padding:2px 10px;border-radius:999px;color:rgba(248,250,252,.85);letter-spacing:.04em;background:rgba(51,65,85,.6);border:1px solid rgba(51,65,85,.9)}
      .${p}-body{position:relative;z-index:1;flex:1;display:flex;${isMid ? 'flex-direction:column;align-items:center;padding:16px 28px;gap:12px;overflow:hidden' : 'align-items:center;gap:14px;padding:10px 14px'}}
      .${p}-avatar{width:${avaSize};height:${avaSize};border-radius:50%;object-fit:cover;border:2px solid rgba(51,65,85,.9);flex-shrink:0}
      .${p}-avatar-ph{width:${avaSize};height:${avaSize};border-radius:50%;background:rgba(30,41,59,.5);border:2px solid rgba(51,65,85,.6);display:flex;align-items:center;justify-content:center;flex-shrink:0}
      .${p}-avatar-ph svg{width:${svgSize};height:${svgSize};fill:rgba(148,163,184,.5)}
      .${p}-stats{display:flex;gap:${isMid ? '24px' : '16px'};${isMid ? '' : 'flex:1'}}
      .${p}-stat{display:flex;flex-direction:column;align-items:center;gap:${isMid ? '2px' : '1px'}}
      .${p}-stat-val{font-size:${isMid ? '20px' : '18px'};font-weight:700}
      .${p}-stat-lbl{font-size:${isMid ? '11px' : '10px'};color:#94a3b8}
      ${isMid ? `.${p}-reviews-title{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:rgba(148,163,184,.7);width:100%}
      .${p}-covers{display:flex;gap:10px;width:100%}
      .${p}-cover{position:relative;width:98px;height:134px;border-radius:6px;overflow:hidden;flex-shrink:0;background:rgba(51,65,85,.5);display:block;text-decoration:none}
      .${p}-cover img{width:100%;height:100%;object-fit:cover;display:block}
      .${p}-cover-grade{position:absolute;bottom:5px;right:5px;width:26px;height:26px;border-radius:50%;background:#0f172a;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;font-family:'Rubik Mono One',monospace}` : ''}
      .${p}-cta{${isMid ? 'margin-top:auto' : 'margin-left:auto'};background:#fbbf24;border:none;color:#0f172a;padding:${isMid ? '8px 22px' : '6px 14px'};border-radius:6px;font-size:${isMid ? '13px' : '11px'};font-weight:700;cursor:pointer;font-family:'Inter',system-ui,sans-serif;text-decoration:none;display:inline-block;white-space:nowrap}
      .${p}-footer{position:relative;z-index:1;display:flex;align-items:center;gap:${isMid ? '14px' : '10px'};padding:${isMid ? '10px 18px' : '7px 14px'};background:rgba(15,23,42,.75);border-top:1px solid rgba(51,65,85,.9);flex-shrink:0}
      .${p}-social-link{display:flex;align-items:center;opacity:.75}
      .${p}-social-link svg{width:${iconSz};height:${iconSz}}
    `;

    const avatarPh = `<div class="${p}-avatar-ph"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2a5 5 0 1 1 0 10A5 5 0 0 1 12 2zm0 12c5.33 0 8 2.67 8 4v2H4v-2c0-1.33 2.67-4 8-4z"/></svg></div>`;
    const avatarHtml = c.avatar
      ? `<img class="${p}-avatar" src="${c.avatar}" alt="${c.name}" loading="eager" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" /><div class="${p}-avatar-ph" style="display:none"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2a5 5 0 1 1 0 10A5 5 0 0 1 12 2zm0 12c5.33 0 8 2.67 8 4v2H4v-2c0-1.33 2.67-4 8-4z"/></svg></div>`
      : avatarPh;

    const socialHtml = social.map(([net, url]) =>
      SOCIAL_SVG[net] ? `<a class="${p}-social-link" href="${url}" target="_blank" rel="noopener">${SOCIAL_SVG[net].replace('fill="#f8fafc"', `fill="#f8fafc" width="${iconSz}" height="${iconSz}"`)}</a>` : ''
    ).join('');

    const midBody = isMid ? `
      ${avatarHtml}
      <div class="${p}-stats">
        <div class="${p}-stat"><span class="${p}-stat-val">${c.reviews_count}</span><span class="${p}-stat-lbl">${tr('public_profile.reviews_label')}</span></div>
        <div class="${p}-stat"><span class="${p}-stat-val">${c.followers_count}</span><span class="${p}-stat-lbl">${tr('public_profile.followers_label')}</span></div>
      </div>
      ${reviews.length ? `
        <p class="${p}-reviews-title">${tr('public_profile.last_reviews')}</p>
        <div class="${p}-covers">
          ${reviews.map(r => {
            const cover = igdbCover(r.product.cover_image);
            const gradeColor = GRADE_HEX[r.letter_grade] ?? '#9e9e9e';
            return `<a class="${p}-cover" href="${origin}/product/${r.product.type}/${r.product.slug}" target="_blank" rel="noopener">${cover ? `<img src="${cover}" alt="${r.product.title}" />` : ''}<span class="${p}-cover-grade" style="color:${gradeColor}">${r.letter_grade}</span></a>`;
          }).join('')}
        </div>` : ''}
      <a class="${p}-cta" href="${origin}/u/${c.id}" target="_blank">${tr('public_profile.view_profile')}</a>
    ` : `
      ${avatarHtml}
      <div class="${p}-stats">
        <div class="${p}-stat"><span class="${p}-stat-val">${c.reviews_count}</span><span class="${p}-stat-lbl">${tr('public_profile.reviews_label')}</span></div>
        <div class="${p}-stat"><span class="${p}-stat-val">${c.followers_count}</span><span class="${p}-stat-lbl">${tr('public_profile.followers_label')}</span></div>
      </div>
      <a class="${p}-cta" href="${origin}/u/${c.id}" target="_blank">${tr('public_profile.view_profile')}</a>
    `;

    return `<!DOCTYPE html><html><head><meta charset="utf-8"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Rubik+Mono+One&display=swap" rel="stylesheet"><style>${css}</style></head><body>
      <div class="${p}">
        ${bg ? `<div class="${p}-bg" style="background-image:url('${bg}')"></div>` : ''}
        <div class="${p}-header">
          <span class="${p}-name">
            ${c.name}
            ${verified ? `<span class="${p}-verified" title="${tr('badges.verificado')}">✓</span>` : ''}
          </span>
          ${isMid ? badges.map(b => `<span class="${p}-badge">${tr('badges.' + b)}</span>`).join('') : ''}
        </div>
        <div class="${p}-body">${midBody}</div>
        ${social.length ? `<div class="${p}-footer">${socialHtml}</div>` : ''}
      </div>
    </body></html>`;
  }
}
