import { Component, inject, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { ApiService } from '../../../core/services/api.service';
import { VerificationRequest, VerificationRequestType } from '../../../core/models/user.model';
import { environment } from '../../../../environments/environment';
import { SOCIAL_NETWORKS } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-verify-request',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [TranslocoModule],
  templateUrl: './user-verify-request.component.html',
  styleUrl: './user-verify-request.component.css',
})
export class UserVerifyRequestComponent implements OnInit {
  private readonly api = inject(ApiService);

  readonly vouchSocials   = Object.entries(environment.vouchSocials).map(([, v]) => v);
  readonly socialNetworks = SOCIAL_NETWORKS;
  readonly pressEmail     = environment.pressEmail;

  readonly loading  = signal(true);
  readonly saving   = signal(false);
  readonly saved    = signal(false);
  readonly existing = signal<VerificationRequest | null>(null);

  readonly type            = signal<VerificationRequestType>('verified');
  readonly socialNetwork   = signal('youtube');
  readonly socialUsername  = signal('');
  readonly pressUrl        = signal('');
  readonly pressContact    = signal('');

  readonly canSubmit = computed(() => {
    if (this.type() === 'verified') {
      return !!this.socialNetwork() && !!this.socialUsername().trim();
    }
    return !!this.pressUrl().trim() && !!this.pressContact().trim();
  });

  ngOnInit(): void {
    this.api.getVerifyRequest().subscribe(r => {
      this.existing.set(r);
      this.loading.set(false);
    });
  }

  submit(): void {
    if (this.saving() || !this.canSubmit()) return;
    this.saving.set(true);

    const payload: Partial<VerificationRequest> =
      this.type() === 'verified'
        ? { type: 'verified', social_network: this.socialNetwork(), social_username: this.socialUsername() }
        : { type: 'press',    press_url: this.pressUrl(),          press_contact:   this.pressContact() };

    this.api.submitVerifyRequest(payload).subscribe({
      next: r => {
        this.existing.set(r);
        this.saving.set(false);
        this.saved.set(true);
      },
      error: () => this.saving.set(false),
    });
  }
}
