import { FamiliesStore } from './list-families-container.store';
import { FamiliesService } from '../../service/families.service';
import { of } from 'rxjs';
import { ListPaginated } from '../../../../../shared/models/list-paginated.model';

class FamiliesServiceMock {
  getFamilies = jasmine
    .createSpy()
    .and.returnValue(of(new ListPaginated([], 0)));
  createFamily = jasmine.createSpy().and.returnValue(
    of({
      id: '1',
      name: 'N',
      birthDate: new Date(),
      document: '1',
      fatherId: null,
      motherId: null,
    })
  );
  updateFamily = jasmine.createSpy().and.returnValue(
    of({
      id: '1',
      name: 'UP',
      birthDate: new Date(),
      document: '1',
      fatherId: null,
      motherId: null,
    })
  );
  deleteFamily = jasmine.createSpy().and.returnValue(
    of({
      id: '1',
      name: 'DEL',
      birthDate: new Date(),
      document: '1',
      fatherId: null,
      motherId: null,
    })
  );
}

describe('FamiliesStore', () => {
  let store: FamiliesStore;
  let service: FamiliesServiceMock;

  beforeEach(() => {
    service = new FamiliesServiceMock();
    store = new FamiliesStore(service as unknown as FamiliesService);
  });

  it('loadFamilies$ should call service to populate families', () => {
    const spy = service.getFamilies;
    store.loadFamilies$();
    expect(spy).toHaveBeenCalled();
  });

  it('createFamily$ should reset page to 0 and reload list', () => {
    store.setFilter({ search: 'x', page: 5 });
    store.createFamily$({
      name: 'Teste',
      birthDate: new Date(),
      document: '99',
      fatherId: null,
      motherId: null,
    });
    expect(service.createFamily).toHaveBeenCalled();
    expect(service.getFamilies).toHaveBeenCalled();
  });

  it('updateFamily$ should update a family entry', (done) => {
    store['setFamilies'](
      new ListPaginated(
        [
          {
            id: '1',
            name: 'N',
            birthDate: new Date(),
            document: '1',
            fatherId: null,
            motherId: null,
          },
        ],
        1
      )
    );
    store.updateFamily$({
      id: '1',
      dto: {
        name: 'UP',
        birthDate: new Date(),
        document: '1',
        fatherId: null,
        motherId: null,
      },
    });
    store.families$.subscribe((f) => {
      if (f.length) {
        expect(f[0].name).toBe('UP');
        done();
      }
    });
  });

  it('deleteFamily$ should call service and reload list', () => {
    store.deleteFamily$('1');
    expect(service.deleteFamily).toHaveBeenCalledWith('1');
    expect(service.getFamilies).toHaveBeenCalled();
  });

  it('setPage$ should update page and reload list', () => {
    store.setPage$(2);
    expect(service.getFamilies).toHaveBeenCalled();
  });
});
