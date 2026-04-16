import { Component, computed, inject, OnInit, signal, ChangeDetectionStrategy,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { ApiService } from '../../../core/services/api.service';
import { UserReviewCard } from '../../../core/models/product.model';
import { IgdbCoverPipe } from '../../../shared/pipes/igdb-cover.pipe';

@Component({
  selector: 'app-user-reviews',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [RouterLink, TranslocoModule, IgdbCoverPipe],
  templateUrl: './user-reviews.component.html',
  styleUrl: './user-reviews.component.css',
})
export class UserReviewsComponent implements OnInit {
  private readonly api = inject(ApiService);

  readonly loading     = signal(true);
  readonly pages       = computed(() =>
    Array.from({ length: this.lastPage() }, (_, i) => i + 1)
  );
  readonly reviews     = signal<UserReviewCard[]>([]);
  readonly search      = signal('');
  readonly currentPage = signal(1);
  readonly lastPage    = signal(1);
  readonly total       = signal(0);

  ngOnInit(): void {
    this.load();
  }

  onSearch(value: string): void {
    this.search.set(value);
    this.currentPage.set(1);
    this.load();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.lastPage()) return;
    this.currentPage.set(page);
    this.load();
  }

  gradeClass(grade: string): string {
    return 'grade-' + grade.replace('+', 'plus').replace('-', 'minus').toLowerCase();
  }

  private load(): void {
    this.loading.set(true);
    this.api.getUserGameReviews(this.search(), this.currentPage()).subscribe(res => {
      this.reviews.set(res.data);
      this.lastPage.set(res.last_page);
      this.total.set(res.total);
      this.loading.set(false);
    });
  }
}
