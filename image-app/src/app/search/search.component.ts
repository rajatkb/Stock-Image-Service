import { Component, OnInit, HostListener, Inject, AfterViewInit, OnDestroy } from '@angular/core';
import { SearchService } from '../services/search.service';
import { map, startWith, defaultIfEmpty, take, tap, debounce, throttle, scan, filter, } from 'rxjs/operators';
import { Observable, Subject, BehaviorSubject, interval } from 'rxjs';
import { FileS } from '../schema/file';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit , OnDestroy{

  constructor(private searchService:SearchService,
    @Inject('Window') private window: Window,
    ) { }
  
  public query:string=""
  public limit:number = 5;
  public uploads$:Observable<FileS[]> = this.searchService.getSearchResults()
                                        .pipe(
                                          tap(() => {
                                            this.spinner$.next(false)
                                          })
                                        )
  public spinner$ = new BehaviorSubject(false)
  private scrollEventSource$ = new Subject<number>()
  private scroll =  this.scrollEventSource$.pipe(
    // throttle( () => interval(100)),
    throttle( () => interval(100) ),
    scan((acc , val)=> {
      return [val, val - acc[0]]
    } , [0 , 0]),
    filter((val) => (val[1] > 0) )
  ).subscribe((val) => {
    this.searchService.search(this.query , this.limit)
    this.spinner$.next(true)
  })


  ngOnInit(): void {
    
  }

  

  searchEnter(event:KeyboardEvent ){
    const value = (<HTMLInputElement>event.target).value
    this.searchService.search(value , this.limit)
    this.spinner$.next(true)

  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event:Event){
    this.scrollEventSource$.next(this.window.scrollY)
  }

  ngOnDestroy() {
    this.scroll.unsubscribe()
  }
  

}
