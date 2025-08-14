import { ModalFamilyDetailsStore } from './modal-family.details.store';
import { FamiliesService } from '../../../families/service/families.service';
import { of, throwError } from 'rxjs';

class FamiliesServiceMock {
  getFamilyById = jasmine.createSpy();
}

describe('ModalFamilyDetailsStore', () => {
  let store: ModalFamilyDetailsStore;
  let service: FamiliesServiceMock;
  const sample = {
    id: '1',
    name: 'N',
    birthDate: new Date(),
    document: '1',
    fatherId: null,
    motherId: null,
  };

  beforeEach(() => {
    service = new FamiliesServiceMock();
    store = new ModalFamilyDetailsStore(service as unknown as FamiliesService);
  });

  it('fetch should load family', (done) => {
    service.getFamilyById.and.returnValue(of(sample));
    store.fetch('1');
    store.family$.subscribe((f) => {
      if (f) {
        expect(f.id).toBe('1');
        done();
      }
    });
  });

  it('fetch should register error', (done) => {
    service.getFamilyById.and.returnValue(throwError(() => new Error('Falha')));
    store.fetch('1');
    store.error$.subscribe((e) => {
      if (e) {
        expect(e).toContain('Falha');
        done();
      }
    });
  });
});
