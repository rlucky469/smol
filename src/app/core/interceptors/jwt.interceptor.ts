import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Login } from '../services/login';
import { Common } from '../services/common';


export const jwtInterceptor: HttpInterceptorFn = (request, next) => {
  const loginService = inject(Login);
  const commonService = inject(Common);
  const currentUser = loginService.isLoggedIn();
  const user = loginService.getUser();
  const token = loginService.getToken();
  const refreshTokenUrl = environment.ApiUrl1 + 'Accounts/refresh-token';

  // Add Authorization header if logged in and not refreshing token
  if (
    currentUser &&
    token &&
    request.url !== refreshTokenUrl
  ) {
    let memberId = commonService.decryptMemberID(user.memberIndex);
    request = request.clone({
      headers: request.headers.set('X-External-User-Id', memberId)
    });

    // AI billing endpoints expect the member bearer token
    if (request.url.includes('/AiBilling/')) {
      request = request.clone({
        headers: request.headers.set('Authorization', `Bearer ${token}`)
      });
    }
  }

  return next(request);
};
