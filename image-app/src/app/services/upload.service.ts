import { Injectable } from '@angular/core';
import { UploadData, UploadStatus } from '../schema/upload';
import { HttpClient, HttpEventType, HttpEvent, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable , merge, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators'
import { ConstantService } from './constants';

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  private baseaddress = this.constants.apibase

  constructor(private httpClient:HttpClient , private constants:ConstantService) { }

  private traceProgress(data:UploadData, index:number , length:number){
    let progress = 0;
    return (ev:HttpEvent<Object>) => {
      if(ev.type == HttpEventType.UploadProgress){
        progress+=(ev.loaded/(ev.total * length)) * 100 - (length * 2)
        let resp:UploadStatus = {
          percentage:progress,
          uploadData: undefined,
          index:index
        }
        return resp;
      }

      if(ev.type == HttpEventType.Response ){
          
          if(ev.status == 200){
            progress = 100/length
            return {
              percentage:progress,
              uploadData: undefined,
              index: index
            }
          }
          else {
            return {
              percentage: -progress,
              uploadData: data,
              index: index
            }
          }
      }

      return {
        percentage: 0,
        uploadData: undefined,
        index: index
      }
    }
  }

  public uploadFiles(fileList:UploadData[]){
    
    const header = new HttpHeaders()
    header.set("Connection","keep-alive")
    let uploadActionList = fileList.map( (data, index) => {
      let formData = new FormData()
      formData.append('file', data.file, );
      formData.append('name' , data.name);
      formData.append('description' , data.description);
      return this.httpClient.post(`${this.baseaddress}/upload/images` , formData , {
        reportProgress:true,
        observe:"events", 
        headers: header
      })
      .pipe(
        catchError( (err:HttpErrorResponse) =>{ 
          return of({
          type:HttpEventType.Response,
          status: err.status,
          statusText:err.statusText
        })}), 
        map( this.traceProgress(data , index , fileList.length)))
        
    })

    return merge( ...uploadActionList)   
  }
}
