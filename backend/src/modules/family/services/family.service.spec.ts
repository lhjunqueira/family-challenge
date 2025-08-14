import { FamilyService } from './family.service';
import { FamilyRepository } from '../repositories/family.repository';
import { UniqueEntityID } from '@/core/unique-entity-id';
import { NotFoundException } from '@nestjs/common';

const makeDto = () => ({
  name: 'Service Test',
  birthDate: new Date('1992-02-02T00:00:00.000Z'),
  document: 'svc-doc',
  fatherId: null,
  motherId: null,
});

describe('FamilyService', () => {
  let service: FamilyService;
  let repository: FamilyRepository;

  beforeEach(() => {
    repository = new FamilyRepository();
    service = new FamilyService(repository);
  });

  it('should create a new family', async () => {
    const created = await service.create(makeDto());
    expect(created.getName()).toBe('Service Test');
  });

  it('should find by id with relations populated', async () => {
    const father = await service.create({ ...makeDto(), name: 'Father' });
    const mother = await service.create({ ...makeDto(), name: 'Mother' });
    const child = await service.create({
      ...makeDto(),
      name: 'Child',
      fatherId: father.getId().toValue(),
      motherId: mother.getId().toValue(),
    });

    const loaded = await service.findById(child.getId());
    expect(loaded.getFather()?.getName()).toBe('Father');
    expect(loaded.getMother()?.getName()).toBe('Mother');
    expect(loaded.getChildren()).toEqual([]);
  });

  it('should update an existing family', async () => {
    const created = await service.create(makeDto());
    const updated = await service.update(created.getId(), {
      ...makeDto(),
      name: 'Updated Name',
    });
    expect(updated.getName()).toBe('Updated Name');
  });

  it('should throw when father does not exist', async () => {
    const fakeId = new UniqueEntityID().toValue();
    await expect(
      service.create({ ...makeDto(), fatherId: fakeId }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should delete a family', async () => {
    const created = await service.create(makeDto());
    await service.delete(created.getId());
    await expect(service.findById(created.getId())).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
