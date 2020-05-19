import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UploadComponent } from './upload/upload.component';
import { SearchComponent } from './search/search.component';
import { LoginComponent } from './login/login.component';


const routes: Routes = [
  {path:"" , component:LoginComponent},
  {path:"login" , component:LoginComponent},
  {path:"upload" , component:UploadComponent},
  {path:"search" , component:SearchComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
