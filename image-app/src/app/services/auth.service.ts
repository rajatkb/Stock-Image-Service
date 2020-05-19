import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';

type Response = { status:number , message?:string , payload?:any };

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseaddress = "http://localhost:3000"

  constructor(private httpClient:HttpClient) { }

  isAuthenticated(){
    if(sessionStorage.getItem('token') !== undefined)
      return true
    else
      return false
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
