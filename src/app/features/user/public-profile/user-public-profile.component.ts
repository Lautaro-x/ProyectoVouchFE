import { Component, computed, inject, OnInit, signal, DOCUMENT, PLATFORM_ID, ChangeDetectionStrategy,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserCardData } from '../../../core/models/user.model';
import { UserProfileCardComponent } from '../../../shared/components/user-profile-card/user-profile-card.component';

const REVIEW_LADDER   = ['el-critico', 'critico-maestro', 'critico-senior', 'critico-junior', 'critico-novel'];
const FOLLOWER_LADDER = ['critico-influyente', 'critico-famoso', 'critico-fiable', 'critico-solicitado', 'critico-amigo'];

const SOCIAL_SVG: Record<string, string> = {
  youtube:   `<svg viewBox="0 0 24 24" fill="#f8fafc"><path d="M21.8 8s-.2-1.4-.8-2c-.8-.8-1.6-.8-2-.9C16.2 5 12 5 12 5s-4.2 0-7 .1c-.4.1-1.2.1-2 .9-.6.6-.8 2-.8 2S2 9.6 2 11.2v1.5c0 1.6.2 3.2.2 3.2s.2 1.4.8 2c.8.8 1.8.8 2.3.8C7 19 12 19 12 19s4.2 0 7-.2c.4-.1 1.2-.1 2-.9.6-.6.8-2 .8-2S22 14.3 22 12.7v-1.5C22 9.6 21.8 8 21.8 8zM10 15V9l5.3 3L10 15z"/></svg>`,
  twitch:    `<svg viewBox="0 0 24 24" fill="#f8fafc"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>`,
  discord:   `<svg viewBox="0 0 24 24" fill="#f8fafc"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.001.022.015.045.036.057a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>`,
  x:         `<svg viewBox="0 0 24 24" fill="#f8fafc"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.213 5.567L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
  instagram: `<svg viewBox="0 0 24 24" fill="#f8fafc"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.059 1.69.073 4.949.073 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`,
};

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
    const reviews  = c.last_reviews?.slice(0, 5) ?? [];
    const origin   = this.doc.location.origin;
    const tr       = (key: string) => this.t.translate(key);

    const isMid   = type === 'mid';
    const p       = isMid ? 'vsc' : 'vmc';
    const w       = isMid ? '480px' : '360px';
    const h       = isMid ? '480px' : '160px';
    const br      = isMid ? '12px' : '10px';
    const avaSize = isMid ? '80px' : '56px';
    const svgSize = isMid ? '40px' : '28px';
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
      .${p}-reviews-wrap{width:100%;display:flex;gap:12px;align-items:flex-start}
      .${p}-reviews{flex:1;display:flex;flex-direction:column;gap:6px}
      .${p}-rrow{font-size:12px;color:rgba(248,250,252,.8);display:flex;align-items:center;gap:6px;text-decoration:none}
      .${p}-rdot{font-size:9px;color:rgba(148,163,184,.5)}
      .${p}-badges{display:flex;flex-direction:column;gap:5px;align-items:flex-end;margin-right:4px;padding-top:2px}` : ''}
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
        <div class="${p}-reviews-wrap">
          <div class="${p}-reviews">
            ${reviews.map(r => `<a class="${p}-rrow" href="${origin}/product/${r.product.type}/${r.product.slug}" target="_blank" rel="noopener"><span class="${p}-rdot">▸</span><span>${r.product.title}</span></a>`).join('')}
          </div>
          ${badges.length ? `<div class="${p}-badges">${badges.map(b => `<span class="${p}-badge">${tr('badges.' + b)}</span>`).join('')}</div>` : ''}
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

    return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${css}</style></head><body>
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
