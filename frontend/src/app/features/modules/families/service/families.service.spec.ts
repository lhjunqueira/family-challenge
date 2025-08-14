import { TestBed } from '@angular/core/testing';
import { FamiliesService } from './families.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ListPaginated } from '../../../../shared/models/list-paginated.model';

describe('FamiliesService', () => {
  let service: FamiliesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FamiliesService],
    });
    service = TestBed.inject(FamiliesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getFamilies should send request with query params', () => {
    service.getFamilies({ search: 'ana', page: 2, limit: 10 }).subscribe();
    const req = httpMock.expectOne((r) => r.url === '/families');
    expect(req.request.params.get('search')).toBe('ana');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('limit')).toBe('10');
    req.flush({ items: [], total: 0 } satisfies ListPaginated<any>);
  });

  it('createFamily should POST payload', () => {
    service
      .createFamily({
        name: 'A',
        birthDate: new Date(),
        document: '1',
        fatherId: null,
        motherId: null,
      })
      .subscribe();
    const req = httpMock.expectOne('/families');
    expect(req.request.method).toBe('POST');
    req.flush({
      id: '1',
      name: 'A',
      birthDate: new Date(),
      document: '1',
      fatherId: null,
      motherId: null,
    });
  });

  it('updateFamily should PUT payload', () => {
    service
      .updateFamily('10', {
        name: 'B',
        birthDate: new Date(),
        document: '2',
        fatherId: null,
        motherId: null,
      })
      .subscribe();
    const req = httpMock.expectOne('/families/10');
    expect(req.request.method).toBe('PUT');
    req.flush({
      id: '10',
      name: 'B',
      birthDate: new Date(),
      document: '2',
      fatherId: null,
      motherId: null,
    });
  });

  it('deleteFamily should DELETE resource', () => {
    service.deleteFamily('20').subscribe();
    const req = httpMock.expectOne('/families/20');
    expect(req.request.method).toBe('DELETE');
    req.flush({
      id: '20',
      name: 'X',
      birthDate: new Date(),
      document: '3',
      fatherId: null,
      motherId: null,
    });
  });
});
