import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { FamilyModule } from './modules/family/family.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), FamilyModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
