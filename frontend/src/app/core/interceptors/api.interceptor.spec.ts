import { HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ApiInterceptor } from './api.interceptor';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

describe('ApiInterceptor', () => {
  const BASE = 'http://localhost:3500';
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: HTTP_INTERCEPTORS, useClass: ApiInterceptor, multi: true },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should prefix relative url with API base', () => {
    http.get('/families').subscribe();
    const req = httpMock.expectOne(`${BASE}/families`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should not change absolute url', () => {
    http.get('http://externo/api').subscribe();
    const req = httpMock.expectOne('http://externo/api');
    expect(req.request.url).toBe('http://externo/api');
    req.flush([]);
  });
});
