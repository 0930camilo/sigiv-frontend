import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Loaderservice } from './core/services/loaderservice';
import { CommonModule } from '@angular/common';
import { AuthService } from './module/auth/service/auth-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = 'sigiv-web-ui';
  initialized = false;

  constructor(
    public loaderService: Loaderservice,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    this.loaderService.show();

    try {
      await this.initializeAuth();
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      this.initialized = true;
      this.loaderService.hide();
    }
  }

  private async initializeAuth(): Promise<void> {
    return new Promise((resolve) => {
      const token = this.authService.getToken();
      if (token) {
        const user = this.authService.getUserData();
        if (user) {
          this.authService['currentUserSubject'].next(user);
        }
      }
      setTimeout(() => resolve(), 100);
    });
  }
}
