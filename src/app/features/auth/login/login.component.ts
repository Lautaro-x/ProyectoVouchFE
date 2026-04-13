import { Component, AfterViewInit, NgZone, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

declare const google: {
  accounts: {
    id: {
      initialize: (config: object) => void;
      renderButton: (element: HTMLElement | null, config: object) => void;
    };
  };
};

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [TranslocoModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements AfterViewInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly ngZone = inject(NgZone);
  private readonly platformId = inject(PLATFORM_ID);

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
      return;
    }

    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (response: { credential: string }) => {
        this.ngZone.run(() => this.handleGoogleCredential(response.credential));
      },
    });

    google.accounts.id.renderButton(document.getElementById('google-signin-btn'), {
      theme: 'filled_black',
      size: 'large',
      text: 'signin_with',
      locale: 'es',
      width: 280,
    });
  }

  private handleGoogleCredential(credential: string): void {
    this.authService.googleLogin(credential).subscribe({
      next: () => this.router.navigate(['/']),
      error: () => {},
    });
  }
}
