import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-user-consents',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [TranslocoModule],
  templateUrl: './user-consents.component.html',
  styleUrl: './user-consents.component.css',
})
export class UserConsentsComponent implements OnInit {
  private readonly api = inject(ApiService);

  readonly loading             = signal(true);
  readonly saving              = signal(false);
  readonly saved               = signal(false);
  readonly showEmail           = signal(false);
  readonly consentFollower     = signal(false);
  readonly isVerified          = signal(false);

  ngOnInit(): void {
    this.api.getConsents().subscribe(c => {
      this.showEmail.set(c.show_email);
      this.consentFollower.set(c.consent_follower_score);
      this.isVerified.set(c.is_verified);
      this.loading.set(false);
    });
  }

  save(): void {
    this.saving.set(true);
    this.saved.set(false);
    this.api.updateConsents({
      show_email:             this.showEmail(),
      consent_follower_score: this.consentFollower(),
    }).subscribe(() => {
      this.saving.set(false);
      this.saved.set(true);
      setTimeout(() => this.saved.set(false), 3000);
    });
  }
}
