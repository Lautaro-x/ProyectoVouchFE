import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';

export const ssrUrlInterceptor: HttpInterceptorFn = (req, next) => {
  if (isPlatformServer(inject(PLATFORM_ID)) && req.url.startsWith('https://pondoxa.com')) {
    return next(req.clone({ url: req.url.replace('https://pondoxa.com', 'http://nginx') }));
  }
  return next(req);
};
