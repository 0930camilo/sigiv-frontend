import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InternalLoader {

  private _loading = new BehaviorSubject<boolean>(false);
  public loading$: Observable<boolean> = this._loading.asObservable();

  constructor() {
    console.log('🔧 InternalLoader service initialized');
  }

  show(): void {
    console.log('%c[InternalLoader Service] 🔵 show() called', 'color: orange; font-weight: bold');
    this._loading.next(true);
  }

  hide(): void {
    console.log('%c[InternalLoader Service] ✅ hide() called', 'color: green; font-weight: bold');
    this._loading.next(false);
  }

  isLoading(): boolean {
    return this._loading.value;
  }

}
