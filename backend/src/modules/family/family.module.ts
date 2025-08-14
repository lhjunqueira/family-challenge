import { Module } from '@nestjs/common';
import { FamilyController } from './controllers/family.controller';
import { FamilyService } from './services/family.service';
import { FamilyRepository } from './repositories/family.repository';
import { FAMILY_REPOSITORY } from './repositories/family.repository.interface';

@Module({
  controllers: [FamilyController],
  providers: [
    FamilyService,
    {
      provide: FAMILY_REPOSITORY,
      useClass: FamilyRepository,
    },
  ],
})
export class FamilyModule {}
