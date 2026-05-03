import {
  Component, computed, inject, OnInit, signal, ChangeDetectionStrategy, HostListener,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { Title } from '@angular/platform-browser';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { SOCIAL_NETWORKS, SOCIAL_NETWORK_MAP, SocialNetworkDef, SocialLinks } from '../../../core/models/user.model';

interface SocialEntry { key: string; url: string; valid: boolean; }

@Component({
  selector: 'app-user-profile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [TranslocoModule, RouterLink],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css',
})
export class UserProfileComponent implements OnInit {
  private readonly api      = inject(ApiService);
  private readonly auth     = inject(AuthService);
  private readonly titleSvc = inject(Title);
  private readonly t        = inject(TranslocoService);

  readonly ALL_NETWORKS = SOCIAL_NETWORKS;
  readonly NET_MAP      = SOCIAL_NETWORK_MAP;

  readonly canRequestVerification = computed(() => {
    const u = this.auth.currentUser();
    return u && u.role !== 'admin' && u.role !== 'critic' && !this.badges().includes('verificado');
  });

  readonly loading          = signal(true);
  readonly saving           = signal(false);
  readonly saved            = signal(false);
  readonly email            = signal('');
  readonly badges           = signal<string[]>([]);
  readonly avatarBroken     = signal(false);
  readonly name             = signal('');
  readonly avatarUrl        = signal('');
  readonly socialEntries    = signal<SocialEntry[]>([]);
  readonly openSelectorIdx  = signal<number | null>(null);

  readonly canAddNetwork = computed(() => this.socialEntries().length < 10);
  readonly usedKeys      = computed(() => this.socialEntries().map(e => e.key));

  @HostListener('document:click')
  closeSelector(): void { this.openSelectorIdx.set(null); }

  ngOnInit(): void {
    this.titleSvc.setTitle(this.t.translate('meta.profile_title'));
    this.api.getProfile().subscribe(profile => {
      this.email.set(profile.email);
      this.name.set(profile.name);
      this.avatarUrl.set(profile.avatar ?? '');
      this.badges.set(profile.badges ?? []);
      const entries: SocialEntry[] = Object.entries(profile.social_links ?? {})
        .filter(([, v]) => v?.url)
        .map(([k, v]) => ({ key: k, url: v!.url, valid: true }));
      this.socialEntries.set(entries);
      this.loading.set(false);
    });
  }

  setAvatarUrl(url: string): void { this.avatarUrl.set(url); this.avatarBroken.set(false); }
  onAvatarError(): void { this.avatarBroken.set(true); }

  availableNets(currentKey: string): SocialNetworkDef[] {
    const used = this.usedKeys();
    return SOCIAL_NETWORKS.filter(n => n.key === currentKey || !used.includes(n.key));
  }

  toggleSelector(e: Event, i: number): void {
    e.stopPropagation();
    this.openSelectorIdx.set(this.openSelectorIdx() === i ? null : i);
  }

  selectNet(e: Event, i: number, key: string): void {
    e.stopPropagation();
    this.socialEntries.update(entries => {
      const copy = [...entries];
      copy[i] = { key, url: '', valid: true };
      return copy;
    });
    this.openSelectorIdx.set(null);
  }

  setNetworkUrl(i: number, url: string): void {
    this.socialEntries.update(entries => {
      const copy = [...entries];
      const def  = SOCIAL_NETWORK_MAP[copy[i].key];
      const valid = !url || (!!def && def.urlPattern.test(url));
      copy[i] = { ...copy[i], url, valid };
      return copy;
    });
  }

  addNetwork(): void {
    const first = SOCIAL_NETWORKS.find(n => !this.usedKeys().includes(n.key));
    if (!first || !this.canAddNetwork()) return;
    this.socialEntries.update(e => [...e, { key: first.key, url: '', valid: true }]);
  }

  removeNetwork(i: number): void {
    this.socialEntries.update(e => e.filter((_, idx) => idx !== i));
  }

  netSvgPath(key: string): string { return SOCIAL_NETWORK_MAP[key]?.svgPath ?? ''; }

  save(): void {
    this.saving.set(true);
    this.saved.set(false);
    const links: SocialLinks = {};
    for (const entry of this.socialEntries()) {
      if (entry.url) links[entry.key] = { url: entry.url, shared: true };
    }
    this.api.updateProfile({ name: this.name(), avatar: this.avatarUrl() || null, social_links: links })
      .subscribe(() => {
        this.auth.updateUser({ name: this.name(), avatar: this.avatarUrl() || null });
        this.saving.set(false);
        this.saved.set(true);
        setTimeout(() => this.saved.set(false), 3000);
      });
  }
}
