import { HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ErrorInterceptor } from './error.interceptor';

describe('ErrorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should propagate formatted error', (done) => {
    http.get('/erro').subscribe({
      next: () => done.fail('should not succeed'),
      error: (err) => {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toContain('Error');
        done();
      },
    });
    const req = httpMock.expectOne('/erro');
    req.flush(
      { message: 'Falhou' },
      { status: 500, statusText: 'Server Error' }
    );
  });
});
