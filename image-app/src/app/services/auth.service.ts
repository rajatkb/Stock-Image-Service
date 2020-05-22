import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { isNull } from 'util';
import { ConstantService } from './constants';

type Response = { status:number , message?:string , payload?:any };

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseaddress = this.constants.apibase

  constructor(private httpClient:HttpClient , private constants:ConstantService) { }

  isAuthenticated(){
    const token = sessionStorage.getItem('token')
    if( isNull(token))
      return false
    if( token === undefined)
      return false

    return true
  }

  getToken(){
    return sessionStorage.getItem('token')
  }

  async login(username:string , password:string):Promise<boolean>{
      try{
        const body = new HttpParams()
                    .set('username', username)
                    .set('password', password);
        let tokenD = await this.httpClient.post<Response>(`${this.baseaddress}/login` ,body,{
          headers: new HttpHeaders()
          .set('Content-Type', 'application/x-www-form-urlencoded')
          }
        ).toPromise()
        if(tokenD.status == 200){
          sessionStorage.setItem('token' , tokenD.payload)
          return true
        }
        return false
      }catch(err){
        return false
      }
    }

}
