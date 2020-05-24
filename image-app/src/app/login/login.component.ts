import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(private authService:AuthService ,private router:Router) { }

  public user = {
    username:"",
    password:"",
  }

  ngOnInit(): void {
  }

  public badPass = false;
  async submitHandler(){
    const resp = await this.authService.login(this.user.username , this.user.password )
    if(resp == true)
      this.router.navigateByUrl('/upload')
    else
      this.badPass = true
  }

}
