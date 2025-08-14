import { Inject, Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONFIG, AppConfig } from '../config/app-config.token';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (!req.url.startsWith('http')) {
      const base = this.config.apiBaseUrl.replace(/\/$/, '');
      const path = req.url.startsWith('/') ? req.url : `/${req.url}`;
      const apiReq = req.clone({ url: `${base}${path}` });

      return next.handle(apiReq);
    }

    return next.handle(req);
  }
}
