import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UploadComponent } from './upload/upload.component';
import { SearchComponent } from './search/search.component';
import { LoginComponent } from './login/login.component';
import { RoutesGuard } from './auth/routes.guard';


const routes: Routes = [
  {path:"" , component:LoginComponent},
  {path:"login" , component:LoginComponent},
  {path:"upload" , component:UploadComponent , canActivate:[RoutesGuard]},
  {path:"search" , component:SearchComponent , canActivate:[RoutesGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
