import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { UploadService } from './services/upload.service'
import { SearchComponent } from './search/search.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms'
import { UploadComponent } from './upload/upload.component';
import { HttpClientModule } from '@angular/common/http'
import { NotifierModule, NotifierService, NotifierOptions } from 'angular-notifier'
import { SearchService } from './services/search.service';
import { LoginComponent } from './login/login.component';
import { AuthService } from './services/auth.service';



@NgModule({
  declarations: [
    AppComponent,
    UploadComponent,
    SearchComponent,
    LoginComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,

  ],
  providers: [
    UploadService,
    SearchService,
    AuthService
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
