/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('FamilyController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/families/:id (GET) returns 404 for unknown id', async () => {
    await request(app.getHttpServer())
      .get('/families/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')
      .expect(404);
  });

  it('/families (POST + GET lifecycle)', async () => {
    const createPayload = {
      name: 'E2E Person',
      birthDate: new Date('1999-09-09T00:00:00.000Z').toISOString(),
      document: 'e2e-doc',
      fatherId: null,
      motherId: null,
    } as const;

    const created: any = await request(app.getHttpServer())
      .post('/families')
      .send(createPayload)
      .expect(201)
      .then((r) => r.body);

    expect(created).toHaveProperty('id');
    expect(created.name).toBe('E2E Person');

    const fetched: any = await request(app.getHttpServer())
      .get(`/families/${created.id}`)
      .expect(200)
      .then((r) => r.body);

    expect(fetched.id).toBe(created.id);
  });
});
