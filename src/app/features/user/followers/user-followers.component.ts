import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { ApiService } from '../../../core/services/api.service';
import { FollowerUser } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-followers',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [RouterLink, TranslocoModule],
  templateUrl: './user-followers.component.html',
  styleUrl: './user-followers.component.css',
})
export class UserFollowersComponent implements OnInit {
  private api = inject(ApiService);

  readonly loading  = signal(true);
  readonly total    = signal(0);
  readonly followers = signal<FollowerUser[]>([]);

  ngOnInit(): void {
    this.api.getFollowers().subscribe({
      next: res => {
        this.total.set(res.total);
        this.followers.set(res.followers);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
