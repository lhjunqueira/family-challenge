import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateUpdateFamilyDto } from '../dtos/create-update-family.dto';
import { FamilyService } from '../services/family.service';
import { FamilyMapper } from '../mappers/family.mapper';
import { UniqueEntityID } from '../../../core/unique-entity-id';
import { ListPaginated } from '../../../shared/types/list-paginated.class';
import { FamilyFilterPaginatedDto } from '../dtos/family-filter-paginated.dto';

@Controller('families')
@ApiTags('families')
export class FamilyController {
  constructor(private readonly familyService: FamilyService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get family by id' })
  @ApiResponse({ status: 200, description: 'Family found.' })
  @ApiResponse({ status: 404, description: 'Family not found.' })
  async findById(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    const family = await this.familyService.findById(new UniqueEntityID(id));
    return FamilyMapper.domainToPresenter(family);
  }

  @Get()
  @ApiOperation({ summary: 'List all families' })
  @ApiResponse({ status: 200, description: 'Families found.' })
  async find(@Query() params?: FamilyFilterPaginatedDto) {
    const families = await this.familyService.findPaginated(params);
    const items = families.items.map((family) =>
      FamilyMapper.domainToPresenter(family),
    );
    return new ListPaginated(items, families.total);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new family' })
  @ApiResponse({ status: 201, description: 'Family created.' })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  async create(@Body() payload: CreateUpdateFamilyDto) {
    const family = await this.familyService.create(payload);
    return FamilyMapper.domainToPresenter(family);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update family' })
  @ApiResponse({ status: 200, description: 'Family updated.' })
  @ApiResponse({ status: 404, description: 'Family not found.' })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() payload: CreateUpdateFamilyDto,
  ) {
    const family = await this.familyService.update(
      new UniqueEntityID(id),
      payload,
    );
    return FamilyMapper.domainToPresenter(family);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove (soft delete) family' })
  @ApiResponse({ status: 204, description: 'Removed.' })
  @ApiResponse({ status: 404, description: 'Not found.' })
  remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.familyService.delete(new UniqueEntityID(id));
  }
}
