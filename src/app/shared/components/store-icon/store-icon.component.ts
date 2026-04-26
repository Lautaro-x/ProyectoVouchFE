import { Component, input } from '@angular/core';

@Component({
  selector: 'app-store-icon',
  standalone: true,
  templateUrl: './store-icon.component.html',
  styleUrl: './store-icon.component.css',
})
export class StoreIconComponent {
  key = input.required<string>();
}
