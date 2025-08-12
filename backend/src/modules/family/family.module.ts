import { Module } from '@nestjs/common';
import { FamilyController } from './controllers/family.controller';
import { FamilyService } from './services/family.service';
import { FamilyRepository } from './repositories/family.repository';

@Module({
  controllers: [FamilyController],
  providers: [FamilyService, FamilyRepository],
})
export class FamilyModule {}
