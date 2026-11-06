import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Api {
  constructor(private http: HttpClient) { }


  updateRefreshToken(subUrl: string, params: any): Observable<any> {
    const options = { withCredentials: true };
    return this.http.post(subUrl, params, options);
  }

  apiPost(subUrl: string, params: any): Observable<any> {
    return this.http.post(subUrl, params);
  }

  apiGet(subUrl: string): Observable<any> {
    return this.http.get(subUrl);
  }


  apiPatch(subUrl: string, params: any): Observable<any> {
    return this.http.patch(subUrl, params);
  }


  apiGetBlob(subUrl: string): Observable<Blob> {
    return this.http.get(subUrl, { responseType: 'blob' });
  }

  apiDelete(subUrl: string, params?: any): Observable<any> {
    return this.http.delete(subUrl, {
      params,
      observe: 'response'
    });
  }

  getAll(subUrl: string): Observable<any> {
    return this.http.get(subUrl);
  }

   apiPostStream(subUrl: string, formData: FormData): Observable<any> {
    return this.http.post(subUrl, formData, {
      reportProgress: true,
      observe: 'events',
      responseType: 'text',
    });
  }

  getBaseUrl(): string {
    return environment.APIURL;
  }
}