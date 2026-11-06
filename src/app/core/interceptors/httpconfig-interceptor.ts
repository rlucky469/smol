import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const httpconfigInterceptor: HttpInterceptorFn = (request, next) => {
  let requesturl = request.url;

    if (requesturl.search('http') >= 0) { }
    else request = request.clone({ url: environment.APIURL + request.url }) 
    if (!request.headers.has('Content-Type')) {
      request = request.clone({ headers: request.headers.set('Content-Type', 'application/json') })
    }
    if (!request.headers.has('Accept')) {
      request = request.clone({ headers: request.headers.set('Accept', 'application/json') })
    }
     if (!request.headers.has('X-API-Key')) {
    request = request.clone({
      headers: request.headers.set('X-API-Key', environment.APIKEY)
    });


  }
    return next(request);

};
