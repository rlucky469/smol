import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { ToastsComponent } from './shared/models/toast/toast';
import { IMemberInfo } from './core/common/header/header';
import { ThemeSwitcher } from './core/common/theme-switcher/theme-switcher';
import { Login } from './core/services/login';
import { Theme } from './core/services/theme';
import { WalletActions } from './store/wallet/wallet.actions';
import { environment } from '../environments/environment.development';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastsComponent, ThemeSwitcher],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private loginService = inject(Login);
  private store = inject(Store);
  readonly themeService = inject(Theme);

  memberInfo: IMemberInfo = {} as IMemberInfo;
  isLoggedIn = false;

  ngOnInit(): void {
    window.speechSynthesis.cancel();
    this.isLoggedIn = this.loginService.isLoggedIn();

    if (this.isLoggedIn) {
      this.memberInfo = this.loginService.getUser();
      this.themeService.checkSetting(this.memberInfo.memberIndex);
      this.store.dispatch(WalletActions.loadWallet());

      if (this.memberInfo.Regmode === '_TRIAL_REG_' && this.memberInfo.emailStatus === 'Not Verified') {
        window.location.href = environment.dashboardDomain;
      }
    }
  }

  // Reads the selected text aloud (text-to-speech accessibility option)
  speak(): void {
    const synth = window.speechSynthesis;
    const bubble = document.getElementById('text-to-speech');

    if (synth.speaking) {
      synth.cancel();
      this.themeService.stopSpeak = false;
      return;
    }

    const text = this.themeService.getSelectedText();
    if (!text || this.themeService.acsbSettings.muteSounds) return;

    this.themeService.stopSpeak = true;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => {
      this.themeService.stopSpeak = false;
      if (bubble) bubble.style.display = 'none';
    };
    synth.speak(utterance);
  }
}
