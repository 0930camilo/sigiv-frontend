import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '../../module/auth/service/auth-service';

@Injectable({
  providedIn: 'root'
})
export class HeaderTokenUtil {
  constructor(private authService: AuthService) { }

  getAuthHeaders(appJson = true, binary = false): HttpHeaders {
    const token = this.authService.getToken();

    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    if (appJson && !binary) {
      headers = headers.set('Content-Type', 'application/json');
    }
    if (binary) {
      headers = headers.set('enctype', 'multipart/form-data');
    }
    return headers;
  }

  getAuthHeadersForFormData(): HttpHeaders {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }
  getAuthObject(): { [header: string]: string } {
    const token = this.authService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}
