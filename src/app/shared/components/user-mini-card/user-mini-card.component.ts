import { Component, input, signal, computed, inject, DOCUMENT,
  ChangeDetectionStrategy,
} from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { UserCardData, SOCIAL_NETWORK_MAP } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-mini-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [TranslocoModule],
  templateUrl: './user-mini-card.component.html',
  styleUrl: './user-mini-card.component.css',
})
export class UserMiniCardComponent {
  private readonly doc = inject(DOCUMENT);

  readonly card = input.required<UserCardData>();

  readonly avatarBroken = signal(false);
  readonly isVerified   = computed(() => this.card().badges?.includes('verificado') ?? false);
  readonly socialEntries = computed(() =>
    Object.entries(this.card().social_links ?? {}).filter((e): e is [string, string] => !!e[1])
  );
  readonly publicProfileUrl = computed(() =>
    `${this.doc.location.origin}/u/${this.card().id}`
  );

  onAvatarError(): void { this.avatarBroken.set(true); }
  netSvgPath(key: string): string { return SOCIAL_NETWORK_MAP[key]?.svgPath ?? ''; }
}
