import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
  })
export class ConstantService {
    public readonly apibase = "http://localhost:3000"
    public readonly filserver = "http://localhost:3000"
}