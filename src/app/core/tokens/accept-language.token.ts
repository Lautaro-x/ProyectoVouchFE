import { InjectionToken } from '@angular/core';

export const ACCEPT_LANGUAGE = new InjectionToken<string | null>('ACCEPT_LANGUAGE', {
  providedIn: 'root',
  factory: () => null,
});
