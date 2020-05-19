import { Component, OnInit } from '@angular/core';
import { SearchService } from '../services/search.service';
import { map, startWith, defaultIfEmpty, } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { FileS } from '../schema/file';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  constructor(private searchService:SearchService) { }
  public limit:number = 2;
  public uploads$:Observable<FileS[]> = this.searchService.getSearchResults()
  public clickSource$ = new Subject()
  public spinner$ = this.clickSource$.pipe(
    defaultIfEmpty(undefined),
    map( v => {
      if(v == undefined)
        return true
      else
        false
    })
  )

  ngOnInit(): void {
    this.uploads$.subscribe(this.clickSource$) 
  }

  searchEnter(event:KeyboardEvent ){
    const value = (<HTMLInputElement>event.target).value
    this.searchService.search(value , this.limit)
    this.clickSource$.next(undefined)
  }
}
