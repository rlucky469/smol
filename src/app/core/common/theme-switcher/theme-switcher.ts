import { Component, inject, OnInit } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { Theme } from '../../services/theme';
import { Login } from '../../services/login';

interface ProfileMode {
  key: 'epilepsySafeMode' | 'visuallyImpairedMode' | 'cognitiveDisabilityMode' | 'ADHDFriendlyMode' | 'blindnessMode';
  title: string;
  text: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-theme-switcher',
  imports: [NgbTooltipModule, NgTemplateOutlet],
  templateUrl: './theme-switcher.html',
  styleUrl: './theme-switcher.scss',
  host: {
    '(document:mousemove)': 'onMouseMove($event)',
    '(document:mouseup)': 'onMouseUp($event)',
    '(document:touchend)': 'onTouchEnd($event)',
  },
})
export class ThemeSwitcher implements OnInit {
  readonly themeService = inject(Theme);
  private loginService = inject(Login);

  apiObj: any = {};
  toggleBox = false;

  readonly colors = ['#0076B4', '#7A549C', '#C83733', '#D07021', '#26999F', '#4D7831', '#ffffff', '#000000'];

  readonly profiles: ProfileMode[] = [
    {
      key: 'epilepsySafeMode',
      title: 'Epilepsy Safe Mode',
      text: 'Reduces color intensity and removes blinking',
      icon: 'fas fa-bolt',
      description:
        'Using this mode eliminates the risk of seizures caused by flashing animations and risky color combinations on the site, allowing people with epilepsy to use it safely.',
    },
    {
      key: 'visuallyImpairedMode',
      title: 'Visually Impaired Mode',
      text: 'Enhances the visual appeal of a website',
      icon: 'fas fa-eye',
      description:
        'With this mode, users with symptoms such as Degrading Eyesight, Tunnel Vision, Cataract, Glaucoma, and others, can access the website more easily.',
    },
    {
      key: 'cognitiveDisabilityMode',
      title: 'Cognitive Disability Mode',
      text: 'Help with reading and focusing',
      icon: 'fas fa-square',
      description:
        'With this mode, users with cognitive impairments such as dyslexia, autism, CVA, and others can better focus on the essential parts of the website.',
    },
    {
      key: 'ADHDFriendlyMode',
      title: 'ADHD Friendly Mode',
      text: 'Improves concentration and reduces distractions',
      icon: 'fa fa-chart-bar',
      description:
        'The mode significantly reduces distractions and enables users with ADHD and neurodevelopmental disorders to read, browse, and focus on main website elements.',
    },
    {
      key: 'blindnessMode',
      title: 'Blindness Mode',
      text: 'Adapts the site to your screen reader',
      icon: 'fas fa-blind',
      description:
        'In this mode, the website is configured to be compatible with screen readers such as JAWS, NVDA, VoiceOver, and TalkBack. The screen reader is software installed on computers and smartphones that blind people use, and websites must be compatible with it.',
    },
  ];

  get settings(): any {
    return this.themeService.acsbSettings;
  }

  ngOnInit(): void {
    this.apiObj = this.loginService.getApiObj();
  }

  toggleProfile(key: ProfileMode['key']): void {
    this.themeService[key]();
  }

  toggleSetting(key: 'readingGuide' | 'readingMask' | 'textSpeech' | 'textMagnifier'): void {
    this.settings[key] = !this.settings[key];
  }

  stepLabel(key: 'contentScaling' | 'fontSize' | 'lineHeight' | 'letterSpacing'): string {
    const percent = this.settings[key].percent;
    return percent === 0 ? 'Default' : `${percent}%`;
  }

  colorClass(color: string, selected: string): string {
    if (color !== selected) return '';
    return color === '#ffffff' ? 'white' : 'active';
  }

  // Moves reading guide, reading mask and magnifier with the cursor
  onMouseMove(e: MouseEvent): void {
    const x = e.clientX;
    const y = e.clientY;

    if (this.settings.readingGuide) {
      const guide = document.getElementById('reading-guide');
      if (guide) {
        guide.style.left = x - 230 + 'px';
        guide.style.top = y + 'px';
      }
    }

    if (this.settings.readingMask) {
      const top = document.getElementById('reading-mask-top');
      const bottom = document.getElementById('reading-mask-bottom');
      if (top) top.style.height = y - 50 + 'px';
      if (bottom) bottom.style.top = y + 50 + 'px';
    }

    if (this.settings.textMagnifier) {
      const tooltip = document.getElementById('text-magnifie-tooltip');
      if (!tooltip) return;
      tooltip.style.top = y + 10 + 'px';
      tooltip.style.left = x + 10 + 'px';

      const target = e.target as HTMLElement;
      const allowed = ['P', 'A', 'LABEL', 'BUTTON', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'SMALL', 'SPAN', 'LI', 'STRONG'];
      const text = target?.innerText || target?.textContent;
      if (text && allowed.includes(target.nodeName)) {
        tooltip.style.visibility = 'visible';
        tooltip.textContent = text;
      } else {
        tooltip.style.visibility = 'hidden';
      }
    }
  }

  onMouseUp(e: MouseEvent): void {
    this.placeSpeechButton(e.target as HTMLElement, e.pageX, e.pageY);
  }

  onTouchEnd(e: TouchEvent): void {
    const touch = e.changedTouches[0];
    if (touch) this.placeSpeechButton(e.target as HTMLElement, touch.pageX, touch.pageY);
  }

  // Shows the speak bubble next to selected text
  private placeSpeechButton(target: HTMLElement, x: number, y: number): void {
    const bubble = document.getElementById('text-to-speech');
    if (!bubble) return;
    if (this.themeService.stopSpeak && !this.themeService.getSelectedText()) return;
    if (!this.settings.textSpeech || target?.getAttribute('data-id') === 'text-to-speech') return;

    this.themeService.stopSpeak = false;
    window.speechSynthesis.cancel();

    if (this.themeService.getSelectedText()) {
      bubble.style.left = x - 40 + 'px';
      bubble.style.top = y - 60 + 'px';
      bubble.style.display = 'block';
    } else {
      bubble.style.display = 'none';
      this.settings.textSpeechBox = false;
    }
  }

  reset(): void {
    this.themeService.reset(this.apiObj.memberId);
    this.toggleBox = false;
  }

  save(): void {
    this.themeService.save(this.apiObj);
    this.toggleBox = false;
  }
}
