import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';

export const ssrUrlInterceptor: HttpInterceptorFn = (req, next) => {
  if (isPlatformServer(inject(PLATFORM_ID))) {
    let url = req.url;
    if (url.startsWith('https://pondoxa.com')) {
      url = url.replace('https://pondoxa.com', 'http://nginx');
    } else if (url.startsWith('/')) {
      url = `http://nginx${url}`;
    }
    return next(req.clone({ url }));
  }
  return next(req);
};
