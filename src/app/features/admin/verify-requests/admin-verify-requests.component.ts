import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import { AdminApiService } from '../services/admin-api.service';
import { VerificationRequestAdmin } from '../models/admin.models';
import { DialogComponent } from '../../../shared/components/dialog/dialog.component';

@Component({
  selector: 'app-admin-verify-requests',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SlicePipe, TranslocoModule, DialogComponent],
  templateUrl: './admin-verify-requests.component.html',
  styleUrl: './admin-verify-requests.component.css',
})
export class AdminVerifyRequestsComponent implements OnInit {
  private readonly api = inject(AdminApiService);

  readonly requests     = signal<VerificationRequestAdmin[]>([]);
  readonly filterStatus = signal<'pending' | 'approved' | 'rejected'>('pending');
  readonly selected     = signal<VerificationRequestAdmin | null>(null);
  readonly detailOpen   = signal(false);
  readonly saving       = signal(false);
  readonly adminNote    = signal('');

  ngOnInit(): void { this.load(); }

  load(): void {
    this.api.getVerifyRequests(this.filterStatus()).subscribe(data => this.requests.set(data));
  }

  setFilter(status: 'pending' | 'approved' | 'rejected'): void {
    this.filterStatus.set(status);
    this.load();
  }

  open(req: VerificationRequestAdmin): void {
    this.selected.set(req);
    this.adminNote.set('');
    this.detailOpen.set(true);
  }

  close(): void { this.detailOpen.set(false); }

  approve(): void {
    const req = this.selected()!;
    this.saving.set(true);
    this.api.approveVerifyRequest(req.id, this.adminNote() || undefined).subscribe({
      next: updated => {
        this.requests.update(list => list.filter(r => r.id !== updated.id));
        this.saving.set(false);
        this.detailOpen.set(false);
      },
      error: () => this.saving.set(false),
    });
  }

  reject(): void {
    const req = this.selected()!;
    this.saving.set(true);
    this.api.rejectVerifyRequest(req.id, this.adminNote() || undefined).subscribe({
      next: updated => {
        this.requests.update(list => list.filter(r => r.id !== updated.id));
        this.saving.set(false);
        this.detailOpen.set(false);
      },
      error: () => this.saving.set(false),
    });
  }
}
