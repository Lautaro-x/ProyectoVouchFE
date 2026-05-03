import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-user-consents',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [TranslocoModule],
  templateUrl: './user-consents.component.html',
  styleUrl: './user-consents.component.css',
})
export class UserConsentsComponent implements OnInit {
  private readonly api  = inject(ApiService);
  private readonly auth = inject(AuthService);

  readonly loading           = signal(true);
  readonly saving            = signal(false);
  readonly saved             = signal(false);
  readonly showEmail         = signal(false);
  readonly consentFollower   = signal(false);
  readonly notifyEmail       = signal(true);
  readonly sessionPersistent = signal(false);
  readonly isVerified        = signal(false);

  ngOnInit(): void {
    this.api.getConsents().subscribe(c => {
      this.showEmail.set(c.show_email);
      this.consentFollower.set(c.consent_follower_score);
      this.notifyEmail.set(c.notify_email);
      this.sessionPersistent.set(c.session_persistent);
      this.isVerified.set(c.is_verified);
      if (c.session_persistent) {
        this.auth.activatePersistentSession();
      }
      this.loading.set(false);
    });
  }

  save(): void {
    this.saving.set(true);
    this.saved.set(false);
    this.api.updateConsents({
      show_email:             this.showEmail(),
      consent_follower_score: this.consentFollower(),
      notify_email:           this.notifyEmail(),
      session_persistent:     this.sessionPersistent(),
    }).subscribe(() => {
      if (this.sessionPersistent()) {
        this.auth.activatePersistentSession();
      } else {
        this.auth.deactivatePersistentSession();
      }
      this.saving.set(false);
      this.saved.set(true);
      setTimeout(() => this.saved.set(false), 3000);
    });
  }
}
