import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
  })
export class ConstantService {
    public readonly apibase = "" // same host deployment
    public readonly filserver = ""
}