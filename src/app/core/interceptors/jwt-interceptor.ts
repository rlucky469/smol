

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
    //  &&
    //   (request.url.startsWith(environment.ApiUrl1) || request.url.startsWith("https://search.fundsforngospremium.com/")
    // )

  ) {

    // request = request.clone({
    //   setHeaders: { Authorization: `Bearer ${token}` }
    // });
    let memberId = commonService.decryptMemberID(user.memberIndex);
    request = request.clone({
      headers: request.headers.set('X-External-User-Id', memberId)
    });
  }

  return next(request);
};

