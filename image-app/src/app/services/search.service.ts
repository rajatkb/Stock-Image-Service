import { Injectable } from '@angular/core';
import {Observable, Subject, from, of} from 'rxjs'
import { HttpClient } from '@angular/common/http';
import { scan, switchMap, map, filter } from 'rxjs/operators';
import { FileS } from '../schema/file';

type QueryData = { query:string , limit:number , offset?:number};
type Response = { offset:number , status:number , message?:string , payload?:any };

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  private baseaddress = "http://localhost:3000"
  private baseImageAddress = "http://localhost:3100"

  private searchRequest$ = new Subject<QueryData>()

  private searchRequestSource$ = this.searchRequest$
  .pipe(
    scan((acc , value:QueryData , index) => {
      let offset = 0
      if(acc.query === value.query)
        offset = index == 0 ? 0 : acc.limit + acc.offset
      return {
        query: value.query,
        limit: value.limit,
        offset: offset
      }
    }, {
      query:"",
      limit:0,
      offset:0
    }),
    switchMap((value) => {
      return this.httpClient.get(`${this.baseaddress}/search/images?query="${value.query} "&limit=${value.limit}&offset=${value.offset}`)
              .pipe(
                map(val => {
                  val["offset"]= value.offset
                  return val
                })
              )
    }),
    map( (val:Response) => {
      val.payload.forEach( (v:FileS) => {
        v.location240 = `${this.baseImageAddress}/uploads/res240/${v.id}.png`
        v.location720 = `${this.baseImageAddress}/uploads/res720/${v.id}.png`
        v.location = `${this.baseImageAddress}/uploads/${v.id}.png`
        v.createdAt = new Date(v.createdAt)
      })
      return val
    }),
    scan( (acc , val ) => {

      if(val.offset == 0)
        return [].concat(val.payload)
      return acc.concat(val.payload)
    } , [] )
  )
  

  constructor(private httpClient:HttpClient) { }

  search(query:string , limit:number){
    this.searchRequest$.next({
      query: query,
      limit: limit
    })
  }
  
  getSearchResults = () => this.searchRequestSource$

}
