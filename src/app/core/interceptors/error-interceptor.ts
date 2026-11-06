import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Api } from '../services/api';
import { Login } from '../services/login';
import { Toast } from '../services/toast';




import {
  BehaviorSubject,
  catchError,
  EMPTY,
  filter,
  finalize,
  Observable,
  switchMap,
  take,
  throwError
} from 'rxjs';




let refreshInProgress = false;
const failedRequests: HttpRequest<any>[] = [];
const retrySubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
let jwtToken = '';

export const errorInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<any> => {
  const API = inject(Api);
  const toast = inject(Toast);
  const loginService = inject(Login);

  const handleAuthError = (): Observable<any> => {
    if (!refreshInProgress) {
      refreshInProgress = true;
      retrySubject.next(null);

      return API.updateRefreshToken(environment.ApiUrl1 + 'Accounts/refresh-token', null).pipe(
        switchMap((res) => {
          if (res.status === 1) {
            jwtToken = res.tokenResponse.jwtToken;
            retryFailedRequests(next);
            return retryRequest(req, next, res);
          } else {

            toast.danger(res.message, 5000)


            setTimeout(() => loginService.logOut(), 3000);
            return throwError(() => new Error('Error occurred'));
          }
        }),
        catchError(() => {
          loginService.logOut();
          return throwError(() => new Error('Refresh token error'));
        }),
        finalize(() => {
          refreshInProgress = false;
        })
      );
    } else {
      addFailedRequest(req);
      return retrySubject.pipe(
        filter((token) => token !== null),
        take(1),
        switchMap(() => {
          const updatedRequest = req.clone({
            setHeaders: { Authorization: `Bearer ${jwtToken}` }
          });
          retryFailedRequests(next);
          return next(updatedRequest);
        })
      );
    }
  };

  const retryRequest = (request: HttpRequest<any>, next: HttpHandlerFn, res: any): Observable<any> => {
    let updatedRequest = request;
    if (!failedRequests.includes(request)) {
      updatedRequest = addTokenHeader(request, res);
    }
    return next(updatedRequest).pipe(
      catchError((error) => {
        if (error.status === 401) {
          toast.warning('Token expired, please login again', 5000)



          setTimeout(() => loginService.logOut(), 3000);
          return EMPTY;
        }
        return throwError(() => new Error('Request retry failed'));
      }),
      finalize(() => {
        retrySubject.next(true);
      })
    );
  };

  const addFailedRequest = (request: HttpRequest<any>) => {
    failedRequests.push(request);
  };

  const retryFailedRequests = (next: HttpHandlerFn) => {
    for (const request of failedRequests) {
      retrySubject.next(request);
    }
    failedRequests.length = 0;
  };

  const addTokenHeader = (request: HttpRequest<any>, response: any): HttpRequest<any> => {
    loginService.setUserAndToken(response.tokenResponse, response, "115.247.76.82", "");
    let headers = request.headers;
    if (response.tokenResponse.jwtToken) {
      headers = headers.set('Authorization', `Bearer ${response.tokenResponse.jwtToken}`);
    }
    return request.clone({ headers });
  };

  // ---- Main interceptor logic ----
  return next(req).pipe(
    catchError((err: any) => {
      if (err instanceof HttpErrorResponse && err.status === 401) {
        return handleAuthError();
      }
      return throwError(() => new Error('Unhandled error occurred'));
    })
  );
};
