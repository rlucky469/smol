import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { BehaviorSubject } from 'rxjs';
import { Common } from './common';

@Injectable({
  providedIn: 'root',
})
export class Login {

  
  isMemberLoggedIn = new BehaviorSubject<boolean>(false)

  constructor(
    private common: Common,

  ) { }

  isLoggedIn(): boolean {
    if (this.common.getCookie(environment.token) && this.common.getCookie(environment.user)) return true
    else return false
  }

  getToken() {
    let token = this.common.getCookie(environment.token),
      decryptToken = this.common.decrypt(environment.tokenKey, token)
    return JSON.parse(decryptToken);
  }




 
  getUser() {
    let user = this.common.getCookie(environment.user);
    if (!user) return null
    let   userInfoDecrypt = this.common.decrypt(environment.userKey, user);
    return JSON.parse(userInfoDecrypt);
  }


  getApiObj() {
    let userInfo = this.getUser();
    return {
      pageIndex: 1,
      pageSize: 20,
      userIp: userInfo.userIp,
      memberId: userInfo.memberIndex,
      platform: userInfo.platForm,
      viewType: userInfo.viewType
    }

  }


  setUserAndToken(tokenResponse: any, user: any, userIp: string, refererUrl: string,) {
    if (user.sessionVariable.regMode === "_FREE_USER_" && user.sessionVariable.memberStatus === "New") {
      window.location.href = 'https://free.fundsforngospremium.com/Dashboard'
    }
    else {
      const userObj = {
        memberIndex: user.sessionVariable.memberId,
        memberType: user.memberFlag,
        viewType: user.sessionVariable.countryId === 230 ? user.sessionVariable.viewType ? user.sessionVariable.viewType : 'LOCAL' : user.sessionVariable.viewType ? user.sessionVariable.viewType : 'GLOBAL',
        viewType1: user.sessionVariable.viewType,
        name: user.sessionVariable.name,
        email: user.sessionVariable.email,
        emailStatus: user.sessionVariable.emailStatus,
        country: user.sessionVariable.country,
        plan: user.sessionVariable.plan,
        planIndex: user.sessionVariable.planId,
        expiryDate: user.sessionVariable.expiry,
        countryIndex: user.sessionVariable.countryId,
        userIp: userIp,
        platForm: user.sessionVariable.platform,
        Regmode: user.sessionVariable.regMode,
        memberStatus: user.sessionVariable.memberStatus,
        password: user.sessionVariable.password,
      }

      let EncrDecrUser = this.common.encrypt(environment.userKey, userObj)
      this.common.setCookie(environment.user, EncrDecrUser, 1)

      let EncrDecrJwtToken = this.common.encrypt(environment.tokenKey, tokenResponse.jwtToken)
      this.common.setCookie(environment.token, EncrDecrJwtToken, 1)
      if (refererUrl) {
        window.location.href = environment.ProposalDomain;
      }
      this.isMemberLoggedIn.next(true)
    }

  }

  reloadMember() {
    if (this.isLoggedIn()) {
      this.isMemberLoggedIn.next(true)
    }
  }

  logOut() {
    this.common.deleteAllCookie()
  }
  
  getRolebaseUrl(recType:string){
     return this.getUser().viewType=== "LOCAL"  && recType  === "OP" ?  environment.USFullSiteSearchUrl : environment.FullSiteSearchUrl
  }

}
