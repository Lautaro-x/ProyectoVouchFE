import { Component, inject, OnInit, signal, computed, ChangeDetectionStrategy,
} from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { ApiService } from '../../../core/services/api.service';
import { UserCardData } from '../../../core/models/user.model';
import { UserMiniCardComponent } from '../../../shared/components/user-mini-card/user-mini-card.component';

@Component({
  selector: 'app-user-following',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [TranslocoModule, UserMiniCardComponent],
  templateUrl: './user-following.component.html',
  styleUrl: './user-following.component.css',
})
export class UserFollowingComponent implements OnInit {
  private readonly api = inject(ApiService);

  readonly loading     = signal(true);
  readonly total       = signal(0);
  readonly following   = signal<UserCardData[]>([]);
  readonly search      = signal('');
  readonly sort        = signal('date_desc');
  readonly currentPage = signal(1);
  readonly lastPage    = signal(1);
  readonly pages       = computed(() =>
    Array.from({ length: this.lastPage() }, (_, i) => i + 1)
  );

  ngOnInit(): void { this.load(); }

  onSearch(value: string): void {
    this.search.set(value);
    this.currentPage.set(1);
    this.load();
  }

  onSort(value: string): void {
    this.sort.set(value);
    this.currentPage.set(1);
    this.load();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.lastPage()) return;
    this.currentPage.set(page);
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.api.getFollowing(this.search(), this.sort(), this.currentPage()).subscribe({
      next: res => {
        this.total.set(res.total);
        this.following.set(res.following);
        this.lastPage.set(res.last_page);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
