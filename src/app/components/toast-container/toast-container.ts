import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from '../../shared/services/toast.service';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none">
      <div *ngFor="let toast of toastService.toasts$ | async; trackBy: trackById"
           [@toastAnimation]
           class="pointer-events-auto min-w-[300px] max-w-md p-4 rounded-xl shadow-2xl flex items-center justify-between gap-4 border border-white/20 backdrop-blur-md"
           [ngClass]="{
             'bg-green-600/90 text-white': toast.type === 'success',
             'bg-red-600/90 text-white': toast.type === 'error',
             'bg-amber-500/90 text-white': toast.type === 'warning',
             'bg-blue-600/90 text-white': toast.type === 'info'
           }">
        <div class="flex items-center gap-3">
          <span class="text-2xl" [ngSwitch]="toast.type">
            <span *ngSwitchCase="'success'">✅</span>
            <span *ngSwitchCase="'error'">❌</span>
            <span *ngSwitchCase="'warning'">⚠️</span>
            <span *ngSwitchCase="'info'">ℹ️</span>
          </span>
          <p class="font-medium text-sm leading-tight">{{ toast.message }}</p>
        </div>
        <button (click)="toastService.remove(toast.id)" class="opacity-70 hover:opacity-100 transition-opacity p-1">
          ✕
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  animations: [
    trigger('toastAnimation', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms cubic-bezier(0.175, 0.885, 0.32, 1.275)', style({ transform: 'translateX(0)', opacity: 1 })),
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 })),
      ]),
    ]),
  ],
})
export class ToastContainerComponent {
  constructor(public toastService: ToastService) {}

  trackById(index: number, toast: ToastMessage): number {
    return toast.id;
  }
}
