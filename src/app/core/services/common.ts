import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import * as moment from 'moment';
import "moment-timezone";
import * as CryptoJS from 'crypto-js';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class Common {


   constructor(private Cookie: CookieService) { }


  public setCookie(key: string, value: string, expireTime: any) {
    this.Cookie.set(key, JSON.stringify(value), { expires: expireTime, path: '/', domain: environment.domain, sameSite: 'Lax' });
    return true
  }

  public getCookie(key: any) {
    let value: any = this.Cookie.get(key);
    try {
      return JSON.parse(value)
    }
    catch (e) {
      return null
    }
  }

  public deleteCookie(key: string) {
    this.Cookie.delete(key);
  }

  public deleteAllCookie() {
    const cookies = document.cookie.split("; ");
    for (let c = 0; c < cookies.length; c++) {
      const cookieName = cookies[c].split(";")[0].split("=")[0].trim();
      if (!environment.excludedCookieNames.includes(cookieName)) {
        var d = window.location.hostname.split(".");
        while (d.length > 0) {
          var cookieBase = encodeURIComponent(cookies[c].split(";")[0].split("=")[0]) + '=; expires=Thu, 01-Jan-1970 00:00:01 GMT; domain=' + d.join('.') + ' ;path=';

          var p = location.pathname.split('/');
          document.cookie = cookieBase + '/';
          while (p.length > 0) {
            document.cookie = cookieBase + p.join('/');
            p.pop();
          };
          d.shift();
        }

      }
    }
    window.location.href = environment.loginDomain;
  }

  public deleteAllCookies() {
    const cookies = document.cookie.split("; ");
    for (let c = 0; c < cookies.length; c++) {
        var d = window.location.hostname.split(".");
        while (d.length > 0) {
          var cookieBase = encodeURIComponent(cookies[c].split(";")[0].split("=")[0]) + '=; expires=Thu, 01-Jan-1970 00:00:01 GMT; domain=' + d.join('.') + ' ;path=';
          var p = location.pathname.split('/');
          document.cookie = cookieBase + '/';
          while (p.length > 0) {
            document.cookie = cookieBase + p.join('/');
            p.pop();
          };
          d.shift();
        }
    }
 
  }




  decryptMemberID(encryptedText: string): string {
    const password = 'FFN@hidden';
    // Convert password to SHA256 hash
    const passwordHash = CryptoJS.SHA256(CryptoJS.enc.Utf8.parse(password));
    const salt = CryptoJS.enc.Hex.parse('0102030405060708090a0b0c0d0e0f10');
    // Key derivation using PBKDF2 (1000 iterations)
    const keyAndIV = CryptoJS.PBKDF2(passwordHash, salt, {
      keySize: 256 / 32 + 128 / 32,
      iterations: 1000,
      hasher: CryptoJS.algo.SHA1,
    });
  
    const key = CryptoJS.lib.WordArray.create(keyAndIV.words.slice(0, 8)); 
    const iv = CryptoJS.lib.WordArray.create(keyAndIV.words.slice(8, 12));
    const correctedText = encryptedText.replace(/\|/g, '=').replace(/ /g, '+');
    const decrypted = CryptoJS.AES.decrypt(correctedText, key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
  
    return decrypted.toString(CryptoJS.enc.Utf8);
  }
  

  //The set method is use for encrypt the value.
  encrypt(key: any, value: any) {
    return CryptoJS.AES.encrypt(JSON.stringify(value), key).toString();
  }

  //The get method is use for decrypt the value.
  decrypt(key: any, value: any) {
    if (!value) return "";
    var decryptKey = CryptoJS.AES.decrypt(value, key);
    return decryptKey.toString(CryptoJS.enc.Utf8);
  }

  
  encryptData(data: string) {
    try {
      const key = CryptoJS.enc.Utf8.parse(environment.cookieKey);
      const iv = CryptoJS.enc.Utf8.parse('');
      const encrypted:any = CryptoJS.AES.encrypt(data, key, {
        keySize: 128 / 8,
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      return  encrypted.toString().replace(/=/g, "|").replace(/\//g, "!").replace(/\+/g, "-")

    } catch (e) {
      console.error(e);
      return null;
    }
  }

  decryptData(encryptedText: string) {
    encryptedText=  encryptedText.replace(/\|/g, "=").replace(/!/g, "/").replace(/\-/g, "+");
    try {
      const key = CryptoJS.enc.Utf8.parse(environment.cookieKey);
      const iv = CryptoJS.enc.Utf8.parse('');
      const decrypted = CryptoJS.AES.decrypt(encryptedText.trim(), key, {
        keySize: 128 / 8,
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  getCurrentDate() {
    return moment.tz("America/New_York").format('YYYY-MM-DD HH:MM:ss')
  }
  

  removeSpecialCharacters(inputString:string) {
    return inputString.replace(/[^\w\s]/gi, '');
  }


}
