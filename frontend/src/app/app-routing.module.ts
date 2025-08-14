import { RouterModule, Routes } from '@angular/router';
import { ListFamiliesContainerComponent } from './features/modules/families/components/list-families-container/list-families-container.component';
import { HomeContainerComponent } from './features/modules/home/components/home-container/home-container.component';
import { NgModule } from '@angular/core';

export const routes: Routes = [
  { path: '', component: HomeContainerComponent },
  { path: 'families', component: ListFamiliesContainerComponent },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
