import { Component, computed, inject, OnInit, signal, ChangeDetectionStrategy,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { ApiService } from '../../../core/services/api.service';
import { UserReviewCard } from '../../../core/models/product.model';
import { IgdbCoverPipe } from '../../../shared/pipes/igdb-cover.pipe';

const GRADES = ['S','A+','A','B+','B','C+','C','D+','D','E+','E','F'];

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

  readonly GRADES      = GRADES;
  readonly loading     = signal(true);
  readonly reviews     = signal<UserReviewCard[]>([]);
  readonly search      = signal('');
  readonly sort        = signal('date_desc');
  readonly gradeFilter = signal('');
  readonly currentPage = signal(1);
  readonly lastPage    = signal(1);
  readonly total       = signal(0);
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

  onGradeFilter(grade: string): void {
    this.gradeFilter.set(grade);
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

  formatDate(dateStr: string): string {
    return new Intl.DateTimeFormat(undefined, { month: 'short', year: 'numeric' }).format(new Date(dateStr));
  }

  private load(): void {
    this.loading.set(true);
    this.api.getUserGameReviews(this.search(), this.currentPage(), this.sort(), this.gradeFilter())
      .subscribe(res => {
        this.reviews.set(res.data);
        this.lastPage.set(res.last_page);
        this.total.set(res.total);
        this.loading.set(false);
      });
  }
}
