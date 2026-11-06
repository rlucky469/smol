import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { DatePipe } from '@angular/common';
import { Api } from './api';
import { Login } from './login';
import { Common } from './common';
@Injectable({
  providedIn: 'root',
})
export class Visitor {

  private datePipe: DatePipe;
  private apiUrl = 'https://api.ipstack.com/'; // IPStack API base URL
  private accessKey = '0ff9e37f150c40a98c0aa015ff56e054'; // Your IPStack API access key


  constructor(
    private API: Api,
    private loginService: Login,
    private common: Common

  ) {
    this.datePipe = new DatePipe('en-US');
  }


  isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  getBrowserMajorVersion(): number {
    const userAgent = window.navigator.userAgent;
    const matches = userAgent.match(/(edge|chrome|safari|firefox|trident(?=\/))\/?\s*(\d+)/i);

    if (matches && matches.length >= 3) {
      const browserName = matches[1].toLowerCase();
      const browserVersion = parseInt(matches[2]);

      if (browserName === 'trident') {
        // For Internet Explorer
        return 11;
      } else {
        return browserVersion;
      }
    }

    return 0;
  }

  getBrowserMinorVersion(): number {
    const userAgent = window.navigator.userAgent;
    const matches = userAgent.match(/(edge|chrome|safari|firefox|trident(?=\/))\/?\s*(\d+)/i);

    if (matches && matches.length >= 3) {
      const browserName = matches[1].toLowerCase();
      const browserVersion = parseInt(matches[2]);

      if (browserName === 'trident') {
        // For Internet Explorer, minor version is not available
        return 0;
      } else {
        // Extract the minor version from the user agent string
        const minorVersionIndex = userAgent.indexOf(browserName) + browserName.length + 1;
        const minorVersionString = userAgent.substring(minorVersionIndex).split('.')[0];
        const browserMinorVersion = parseInt(minorVersionString);

        return isNaN(browserMinorVersion) ? 0 : browserMinorVersion;
      }
    }

    return 0;
  }

  getBrowserName(): string {
    const userAgent = window.navigator.userAgent;
    const browserMatches = userAgent.match(/(edge|chrome|safari|firefox|trident(?=\/))\/?\s*(\d+)/i);

    if (browserMatches && browserMatches.length >= 2) {
      const browserName = browserMatches[1].toLowerCase();

      if (browserName === 'trident') {
        return 'Internet Explorer';
      } else {
        return browserName;
      }
    }

    return 'Unknown';
  }


  getTimeZone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  formatDate(date: Date): string {
    return this.datePipe.transform(date, 'yyyy-MM-dd HH:mm:ss') || '';
  }

  sendMemberLog(module: string,) {
    let memberGeolocation = this.common.getCookie('memberGeolocation');
    if (memberGeolocation) {
      let res: any = this.common.decrypt('memberGeolocation', memberGeolocation);
      res = JSON.parse(res)
      this.sendVisitorLog(res, module)
    }
    else {
      this.getMemberGeolocation(module)
    }
  }

  getMemberGeolocation(module: string,) {
    const url = `${this.apiUrl}/check?access_key=${this.accessKey}`;
    this.API.getAll(url).subscribe((res) => {
      if (res) {
        let memberGeolocation = this.common.encrypt("memberGeolocation", res)
        this.common.setCookie("memberGeolocation", memberGeolocation, 30)
        this.sendVisitorLog(res, module)
      }
    })
  }

  sendVisitorLog(res: any, module: string) {

    this.API.apiPost('Member/VisitorLog', {
      memberId: this.loginService.getApiObj().memberId,
      country: res.country_name,
      countryCode: res.country_code,
      region: res.region_name,
      regionCode: res.region_code,
      city: res.city,
      latitude: res.latitude + '',
      longitude: res.longitude + '',
      timeZone: this.getTimeZone() + '',
      clientTimeStamp: this.formatDate(new Date()),
      clientIP: res.ip,
      browser: this.getBrowserName() + '',
      browserMajor: this.getBrowserMajorVersion() + '',
      browserMinor: this.getBrowserMinorVersion() + '',
      isMobile: this.isMobile() + '',
      platform: "Angular",
      module: "Grants",
      referenceId: "0",
      refrenceUrl: document.referrer,
      currentUrl: environment.ProposalDomain + module
    }).subscribe((Response) => {

    })

  }

}
