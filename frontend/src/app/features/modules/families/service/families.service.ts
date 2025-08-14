import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FamilyModel } from '../models/family.model';
import { FilterFamiliesPaginatedDto } from '../dto/filter-families-paginated.dto';
import { CreateUpdateFamilyDto } from '../dto/create-update-family.dto';
import { ListPaginated } from '../../../../shared/models/list-paginated.model';
import { map } from 'rxjs/operators';
import { adaptFamily, adaptFamilies } from '../models/family.adapter';

@Injectable({ providedIn: 'root' })
export class FamiliesService {
  constructor(private readonly http: HttpClient) {}

  getFamilyById(id: string): Observable<FamilyModel> {
    return this.http.get(`/families/${id}`).pipe(map(adaptFamily));
  }

  getFamilies(
    dto?: FilterFamiliesPaginatedDto
  ): Observable<ListPaginated<FamilyModel>> {
    let params = new HttpParams();

    if (dto) {
      if (dto.search) params = params.set('search', dto.search);
      if (dto.page) params = params.set('page', dto.page.toString());
      if (dto.limit) params = params.set('limit', dto.limit.toString());
    }

    return this.http
      .get<ListPaginated<FamilyModel>>('/families', { params })
      .pipe(
        map((res: any) => ({ ...res, items: adaptFamilies(res.items || []) }))
      );
  }

  createFamily(family: CreateUpdateFamilyDto): Observable<FamilyModel> {
    return this.http.post('/families', family).pipe(map(adaptFamily));
  }

  updateFamily(
    id: string,
    family: CreateUpdateFamilyDto
  ): Observable<FamilyModel> {
    return this.http.put(`/families/${id}`, family).pipe(map(adaptFamily));
  }

  deleteFamily(familyId: string): Observable<FamilyModel> {
    return this.http.delete(`/families/${familyId}`).pipe(map(adaptFamily));
  }
}
