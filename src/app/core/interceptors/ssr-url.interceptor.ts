import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';

const NGINX = 'http://nginx';
const ORIGINS = ['https://pondoxa.com', 'http://localhost'];

export const ssrUrlInterceptor: HttpInterceptorFn = (req, next) => {
  if (isPlatformServer(inject(PLATFORM_ID))) {
    let url = req.url;
    const origin = ORIGINS.find(o => url.startsWith(o));
    if (origin) {
      url = `${NGINX}${url.slice(origin.length)}`;
    } else if (url.startsWith('/')) {
      url = `${NGINX}${url}`;
    }
    return next(req.clone({ url }));
  }
  return next(req);
};
