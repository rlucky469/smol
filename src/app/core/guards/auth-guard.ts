// auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Login } from '../services/login';
import { Common } from '../services/common';
import { environment } from '../../../environments/environment';

export const authGuard: CanActivateFn = (route, state) => {
  const loginService = inject(Login);
  const router = inject(Router);
  const common = inject(Common);

  if (loginService.isLoggedIn()) {
    const user = loginService.getUser();

    const allowedRoles = route.data?.['roles'];

    if (allowedRoles && !allowedRoles.includes(user.memberType)) {
      router.navigate(['']);
      return false;
    }

    if (allowedRoles && !allowedRoles.includes(user.viewType)) {
      return false;
    }

    return true;
  }

  // Not logged in — redirect to login page
  common.setCookie(environment.submitUrl, window.location.href, 1);
  window.location.href = environment.loginDomain;

  return false; // Important: don't allow navigation if not logged in
};
