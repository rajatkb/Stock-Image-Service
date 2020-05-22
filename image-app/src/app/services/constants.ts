import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
  })
export class ConstantService {
    public readonly apibase = "http://35.208.156.20:3000"
    public readonly filserver = "http://35.208.156.20:3100"
}