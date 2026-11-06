import { Injectable } from '@angular/core';
import { Api } from './api';
import { Toast } from '../../core/services/toast';


@Injectable({
  providedIn: 'root',
})
export class Theme {

  root = document.documentElement;
  fontVar = ['--bodyFont', '--headingFont', '--subTitleFont', '--detailFont', '--smallFont']
  textAlign = [
    { name: '--textLeft', value: 'left' },
    { name: '--textRight', value: 'right' },
    { name: '--textCenter', value: 'center' },
    { name: '--textJustify', value: 'justify' }
  ]

  triggers = false;
  stopSpeak: boolean = false;

  allVar = [
    { name: '--bodyFont', value: '14px' },
    { name: '--headingFont', value: '24px' },
    { name: '--subTitleFont', value: '18px' },
    { name: '--detailFont', value: '16px' },
    { name: '--smallFont', value: '12px' },
    { name: '--letterSpacing', value: '0px' },
    { name: '--lineHeight', value: '160%' },
    { name: '--zoom', value: '1' },
    { name: '--textLeft', value: 'left' },
    { name: '--textRight', value: 'right' },
    { name: '--textCenter', value: 'center' },
    { name: '--textJustify', value: 'justify' },
    { name: '--highLightTitle', value: 'none' },
    { name: '--highLightLink', value: 'none' },

    { name: '--titleClr', value: '#0095c0' },
    { name: '--textClr', value: 'black' },
    { name: '--bgClr', value: '#f8f9fd' },

    { name: '--linkClr', value: '#0095c0' },
    { name: '--primaryClr', value: '#0095c0' },

    { name: '--filter', value: 'none' },
    { name: '--bgBlack', value: 'black' },
    { name: '--bgBlackTextClr', value: 'white' },

    { name: '--bgPrimary', value: '#0095c0' },
    { name: '--bgPrimaryText', value: 'white' },

    { name: '--highLightBox', value: 'white' },
    { name: '--shadow', value: '0px -1px 8px 0px #e6e9f9e6' },

    { name: '--bgWhite', value: 'white' },
    { name: '--bgWhiteTextClr', value: 'black', },

    { name: '--hoverClr', value: '#0095c0' },
    { name: '--border', value: 'none' },
    { name: '--fontFamily', value: 'Poppins,sans-serif' },
    { name: '--shadow1', value: '0px -1px 8px 0px #e6e9f9e6' },
    { name: '--visitedClr', value: '#00c7ff' }
  ]

  colorObj: any = {
    '#0076B4': '#43a5d9',
    '#C83733': '#ff0700',
    '#7A549C': '#9d39f7',
    '#D07021': '#ff7300',
    '#26999F': '#50e9f1',
    '#4D7831': '#6fd52c',
    '#ffffff': '#c1bdbd',
    '#000000': '#646262',
  }

  allBodyClass = ['hide-images', 'stop-animations', 'highlight-hover', 'highlight-focus',]

  acsbSettings: any = {
    id: 0,
    epilepsySafeMode: false,
    visuallyImpairedMode: false,
    cognitiveDisabilityMode: false,
    ADHDFriendlyMode: false,
    blindnessMode: false,

    muteSounds: false,
    hideImages: false,
    virtualKeyboard: false,

    readingGuide: false,

    stopAnimations: false,
    readingMask: false,
    highlightHover: false,
    highlightFocus: false,

    bigBlackCursor: false,
    bigWhiteCursor: false,

    navigationKeys: false,

    textMagnifier: false,
    readableFont: false,
    dyslexiaFriendly: false,

    highlightTitles: false,
    highlightLinks: false,

    textSpeech: false,



    themeColor: '',

    textColor: '',
    titleColor: '',
    bgColor: '',

    textAlign: '',


    contentScaling: {
      value: '',
      percent: 0
    },
    fontSize: {
      value: '',
      percent: 0
    },
    lineHeight: {
      value: '',
      percent: 0
    },
    letterSpacing: {
      value: '',
      percent: 0,
    }
  }


 constructor(
    private api: Api,
    private toast: Toast
  ) {}


  epilepsySafeMode() {
    this.acsbSettings.visuallyImpairedMode ? this.visuallyImpairedMode() : '';
    this.acsbSettings.cognitiveDisabilityMode ? this.cognitiveDisabilityMode() : '';
    this.acsbSettings.ADHDFriendlyMode ? this.ADHDFriendlyMode() : '';
    this.acsbSettings.blindnessMode ? this.blindnessMode() : '';
    if (!this.acsbSettings.epilepsySafeMode) {
      this.acsbSettings.epilepsySafeMode = true;
      this.acsbSettings.stopAnimations ? '' : this.stopAnimation()
      this.saturation('low')
    }
    else {
      this.acsbSettings.stopAnimations ? this.stopAnimation() : '';
      this.saturation('');
      this.acsbSettings.epilepsySafeMode = false;
    }
  }

  visuallyImpairedMode() {
    this.acsbSettings.epilepsySafeMode ? this.epilepsySafeMode() : '';
    this.acsbSettings.cognitiveDisabilityMode ? this.cognitiveDisabilityMode() : '';
    this.acsbSettings.ADHDFriendlyMode ? this.ADHDFriendlyMode() : '';
    this.acsbSettings.blindnessMode ? this.blindnessMode() : '';
    if (!this.acsbSettings.visuallyImpairedMode) {
      this.acsbSettings.visuallyImpairedMode = true;
      this.saturation('high')
      this.acsbSettings.readableFont ? '' : this.changeFont('Readable')
    }
    else {
      this.acsbSettings.visuallyImpairedMode = false;
      this.saturation('')
      this.acsbSettings.readableFont ? this.changeFont('Readable') : ''
    }
  }

  cognitiveDisabilityMode() {

    this.acsbSettings.epilepsySafeMode ? this.epilepsySafeMode() : '';
    this.acsbSettings.visuallyImpairedMode ? this.visuallyImpairedMode() : '';
    this.acsbSettings.ADHDFriendlyMode ? this.ADHDFriendlyMode() : '';
    this.acsbSettings.blindnessMode ? this.blindnessMode() : '';
    if (!this.acsbSettings.cognitiveDisabilityMode) {
      this.acsbSettings.cognitiveDisabilityMode = true;
      this.acsbSettings.stopAnimations ? '' : this.stopAnimation();
      this.acsbSettings.highlightTitles ? '' : this.highlight('--highLightTitle');
      this.acsbSettings.highlightLinks ? '' : this.highlight('--highLightLink');
    }
    else {
      this.acsbSettings.stopAnimations ? this.stopAnimation() : '';
      this.acsbSettings.highlightTitles ? this.highlight('--highLightTitle') : '';
      this.acsbSettings.highlightLinks ? this.highlight('--highLightLink') : '';
      this.acsbSettings.cognitiveDisabilityMode = false;
    }
  }

  ADHDFriendlyMode() {
    this.acsbSettings.epilepsySafeMode ? this.epilepsySafeMode() : '';
    this.acsbSettings.visuallyImpairedMode ? this.visuallyImpairedMode() : '';
    this.acsbSettings.cognitiveDisabilityMode ? this.cognitiveDisabilityMode() : '';
    this.acsbSettings.blindnessMode ? this.blindnessMode() : '';
    if (!this.acsbSettings.ADHDFriendlyMode) {
      this.acsbSettings.ADHDFriendlyMode = true;
      this.saturation('high')
      if (!this.acsbSettings.readingMask) {
        this.acsbSettings.readingMask = true;
      }
    }
    else {
      this.acsbSettings.ADHDFriendlyMode = false;
      if (this.acsbSettings.readingMask) {
        this.acsbSettings.readingMask = false;
      }
      this.saturation('')
    }
  }

  blindnessMode() {
    this.acsbSettings.epilepsySafeMode ? this.epilepsySafeMode() : '';
    this.acsbSettings.visuallyImpairedMode ? this.visuallyImpairedMode() : '';
    this.acsbSettings.cognitiveDisabilityMode ? this.cognitiveDisabilityMode() : '';
    this.acsbSettings.ADHDFriendlyMode ? this.ADHDFriendlyMode() : '';
    if (!this.acsbSettings.blindnessMode) {
      this.acsbSettings.blindnessMode = true;
      this.acsbSettings.readableFont ? '' : this.changeFont('Readable')
      if (!this.acsbSettings.textSpeech) {
        this.acsbSettings.textSpeech = true;
      }
      if (!this.acsbSettings.virtualKeyboard) {
        this.acsbSettings.virtualKeyboard = true;
      }
      if (this.acsbSettings.navigationKeys) {
        this.acsbSettings.navigationKeys = false;
      }
    }
    else {
      this.acsbSettings.blindnessMode = false;
      this.acsbSettings.readableFont ? this.changeFont('Readable') : ''
      if (this.acsbSettings.textSpeech) {
        this.acsbSettings.textSpeech = false;
      }
      if (this.acsbSettings.virtualKeyboard) {
        this.acsbSettings.virtualKeyboard = false;
      }
      if (this.acsbSettings.navigationKeys) {
        this.acsbSettings.navigationKeys = false;
      }

    }
  }



  contentScaling(type: string) {
    let geZoomValue = this.getVariableValue('--zoom')
    if (type === 'inc') {
      this.setVeriableValue('--zoom', `${Number(geZoomValue) + 0.05}`)
      this.acsbSettings.contentScaling = {
        value: `${Number(geZoomValue) + 0.05}`,
        percent: this.acsbSettings.contentScaling.percent + 5,

      }
    }
    else {
      this.setVeriableValue('--zoom', `${Number(geZoomValue) - 0.05}`)
      this.acsbSettings.contentScaling = {
        value: `${Number(geZoomValue) - 0.05}`,
        percent: this.acsbSettings.contentScaling.percent - 5,

      }
    }
  }

  changeFont(font: string) {
    let bodyClass = document.body.classList;
    if (font === 'Readable') {
      bodyClass.remove('dyslexia-font');
      this.acsbSettings.dyslexiaFriendly = false;
      this.classAddAndRemove('readable-font', 'readableFont');
    }
    else {
      bodyClass.remove('readable-font');
      this.acsbSettings.readableFont = false;
      this.classAddAndRemove('dyslexia-font', 'dyslexiaFriendly');
    }
  }

  highlight(key: string) {
    let getHighlightValue = this.getVariableValue(key)
    if (getHighlightValue === "none") {
      this.setVeriableValue(key, '#639af9 solid 2px')
      this.setVeriableValue('--highLightBoth', '#639af9 solid 2px')
      key === '--highLightTitle' ? this.acsbSettings.highlightTitles = true : '';
      key === '--highLightLink' ? this.acsbSettings.highlightLinks = true : '';
    }
    else {
      this.setVeriableValue(key, 'none')
      this.setVeriableValue('--highLightBoth', 'none')
      key === '--highLightTitle' ? this.acsbSettings.highlightTitles = false : '';
      key === '--highLightLink' ? this.acsbSettings.highlightLinks = false : '';
    }
  }

  fontSizing(type: string) {
    const getBodyFont = (val: String) => {
      return this.getVariableValue(val).replace('px', '')
    }
    if (type === 'inc') {
      this.fontVar.map((val) => {
        var bodyFont: any = getBodyFont(val);
        this.setVeriableValue(val, `${Number(bodyFont) + 1}px`)
      })
      this.acsbSettings.fontSize = {
        value: `${Number(getBodyFont('--smallFont')) + 1}px`,
        percent: this.acsbSettings.fontSize.percent + 5,
      }
    }
    else {
      this.fontVar.map((val) => {
        var bodyFont: any = getBodyFont(val);
        this.setVeriableValue(val, `${Number(bodyFont) - 1}px`)
      })
      this.acsbSettings.fontSize = {
        value: `${Number(getBodyFont('--smallFont')) - 1}px`,
        percent: this.acsbSettings.fontSize.percent - 5,
      }
    }
  }

  textAlignChange(value: string) {
    if (!this.acsbSettings.textAlign || this.acsbSettings.textAlign !== value) {
      this.textAlign.map((key) => {
        this.setVeriableValue(key.name, value)
      })
      this.acsbSettings.textAlign = value;
    }
    else {
      this.textAlign.map((key) => {
        this.setVeriableValue(key.name, key.value)
      })
      this.acsbSettings.textAlign = '';
    }
  }

  lineHeight(type: string) {

    let getlineHeightValue = this.getVariableValue('--lineHeight').replace('%', '')
    if (type === 'inc') {
      this.setVeriableValue('--lineHeight', `${Number(getlineHeightValue) + 1}%`)
      this.acsbSettings.lineHeight = {
        value: `${Number(getlineHeightValue) + 1}%`,
        percent: this.acsbSettings.lineHeight.percent + 5,

      }
    }
    else {
      this.setVeriableValue('--lineHeight', `${Number(getlineHeightValue) - 1}%`)
      this.acsbSettings.lineHeight = {
        value: `${Number(getlineHeightValue) - 1}%`,
        percent: this.acsbSettings.lineHeight.percent - 5,
      }
    }
  }

  ltrSpacing(type: string) {
    let getLtrSpacingValue = this.getVariableValue('--letterSpacing').replace('px', '')
    if (type === 'inc') {
      this.setVeriableValue('--letterSpacing', `${Number(getLtrSpacingValue) + 0.050}px`)
      this.acsbSettings.letterSpacing = {
        value: `${Number(getLtrSpacingValue) + 0.050}px`,
        percent: this.acsbSettings.letterSpacing.percent + 5,

      }
    }
    else {
      this.setVeriableValue('--letterSpacing', `${Number(getLtrSpacingValue) - 0.050}px`)
      this.acsbSettings.letterSpacing = {
        value: `${Number(getLtrSpacingValue) - 0.050}px`,
        percent: this.acsbSettings.letterSpacing.percent - 5,

      }
    }
  }

  darkMode() {
    this.root?.style.setProperty('--filter', 'none');
    if (this.acsbSettings.themeColor === 'light') {
      this.lightMode()
    }

    let varList = [
      { key: '--bgClr', light: '#f8f9fd', dark: '#18191a' },
      { key: '--highLightBox', light: 'white', dark: '#272822' },
      { key: '--textClr', light: 'black', dark: 'white' },
      { key: '--titleClr', light: '#0095c0', dark: '#0ac8ff' },
      { key: '--primaryClr', light: '#0095c0', dark: '#0ac8ff' },
      { key: '--linkClr', light: '#0095c0', dark: '#0ac8ff' },
      { key: '--bgPrimary', light: '#0095c0', dark: '#272822' },
      { key: '--bgWhite', light: 'white', dark: '#18191a' },
      { key: '--titleBlackClr', light: 'black', dark: 'white' },


      { key: '--shadow1', light: '0px -1px 8px 0px #e6e9f9e6', dark: 'unset' },
    ]
    if (!this.acsbSettings.themeColor || this.acsbSettings.themeColor !== 'dark') {
      varList.map((val) => {
        this.setVeriableValue(val.key, val.dark)
      })
      this.acsbSettings.themeColor = 'dark';
    }
    else {
      varList.map((val) => {
        this.setVeriableValue(val.key, val.light)
      })
      this.acsbSettings.themeColor = '';
    }
  }

  lightMode() {
    this.root?.style.setProperty('--filter', 'none');
    if (this.acsbSettings.themeColor === 'dark') {
      this.darkMode()
    }
    let varList = [
      { key: '--bgBlack', light: 'white', normal: 'black' },
      { key: '--bgBlackTextClr', light: 'black', normal: 'white' },
      { key: '--titleClr', light: 'black', normal: '#0095c0' },
      { key: '--bgClr', light: 'white', normal: '#f8f9fd' },
      { key: '--bgPrimaryText', light: 'black', normal: 'white' },
      { key: '--hoverClr', light: '#0095c0', normal: '#0095c0' },
      { key: '--bgPrimary', light: 'white', normal: '#0095c0' },
      { key: '--border', light: '1px solid #ddd', normal: 'none' },


    ]
    if (!this.acsbSettings.themeColor || this.acsbSettings.themeColor !== 'light') {
      varList.map((val) => {
        this.setVeriableValue(val.key, val.light)
      })
      this.acsbSettings.themeColor = 'light';
    }
    else {
      varList.map((val) => {
        this.setVeriableValue(val.key, val.normal)
      })
      this.acsbSettings.themeColor = '';
    }


  }

  saturation(value: string) {

    this.acsbSettings.themeColor === 'light' ? this.lightMode() : '';
    this.acsbSettings.themeColor === 'dark' ? this.darkMode() : '';

    let getHighlightValue = this.getVariableValue('--filter')
    let filterObj: any = {
      low: 'saturate(50%)',
      high: 'saturate(200%)',
      grayscale: 'grayscale(100%)',
      contrast: 'contrast(135%)',
    }

    if (getHighlightValue === "none" || getHighlightValue !== filterObj[value]) {
      this.setVeriableValue('--filter', filterObj[value])
      this.acsbSettings.themeColor = value;
    }
    else {
      this.root?.style.setProperty('--filter', 'none');
      this.acsbSettings.themeColor = '';
    }
  }

  changeColor(clrCat: string, key: string, clrName: string) {

    let getHighlightValue = this.getVariableValue(key)

    if (clrCat === 'text') {
      if (clrName !== getHighlightValue) {
        this.setVeriableValue(key, clrName)
        this.acsbSettings.textColor = clrName;
        this.setVeriableValue('--bgPrimaryText', clrName)
        this.setVeriableValue('--linkClr', clrName)
      }
      else {
        this.setVeriableValue(key, 'black')
        this.setVeriableValue('--bgPrimaryText', 'white')
        this.setVeriableValue('--linkClr', '#0095c0')
        this.acsbSettings.textColor = '';
      }
    }

    else if (clrCat === 'title') {

      if (clrName !== getHighlightValue) {
        this.setVeriableValue(key, clrName)
        this.acsbSettings.titleColor = clrName;
        this.setVeriableValue('--titleBlackClr', clrName)
        this.setVeriableValue('--visitedClr', this.colorObj[clrName])

      }
      else {
        this.acsbSettings.titleColor = '';
        this.setVeriableValue(key, '#0095c0')
        this.setVeriableValue('--visitedClr', '#00c7ff')
        this.setVeriableValue('--titleBlackClr', 'black')

      }
    }

    else if (clrCat === 'bg') {
      let varList = [
        { key: '--highLightBox', default: 'white' },
        { key: '--bgPrimary', default: '#0095c0' },
        { key: '--bgWhite', default: 'white' },
        { key: '--bgBlack', default: 'black' },
        { key: '--bgClr', default: '#f8f9fd' },
      ]

      if (clrName !== getHighlightValue) {
        varList.map((val) => {
          this.setVeriableValue(val.key, clrName)
        })
        this.setVeriableValue('--border', '1px solid #ddd')
        this.acsbSettings.bgColor = clrName;
      }
      else {
        varList.map((val) => {
          this.setVeriableValue(val.key, val.default)
        })
        this.setVeriableValue('--border', 'none')
        this.acsbSettings.bgColor = '';

      }
    }
  }

  muteSounds() {
    this.acsbSettings.muteSounds = !this.acsbSettings.muteSounds;
  }

  hideImages() {
    this.classAddAndRemove('hide-images', 'hideImages')
  }

  stopAnimation() {
    this.classAddAndRemove('stop-animations', 'stopAnimations')
  }

  highlightHover() {
    this.classAddAndRemove('highlight-hover', 'highlightHover')
  }

  highlightFocus() {
    this.classAddAndRemove('highlight-focus', 'highlightFocus')
  }

  cursorChange(value: string, objKey: string) {
    let bodyClass: any = document.body.classList;
    if (value === 'big-white-cursor') {
      bodyClass.remove('big-black-cursor');
      this.acsbSettings.bigBlackCursor = false;
    }
    else if (value === 'big-black-cursor') {
      bodyClass.remove('big-white-cursor');
      this.acsbSettings.bigWhiteCursor = false;
    }

    this.classAddAndRemove(value, objKey)
  }

  virtualKeyboard() {
    this.acsbSettings.virtualKeyboard = !this.acsbSettings.virtualKeyboard;
  }


  reset(memberId: String) {
    this.api.apiPost('Master/DeleteAngAppSettings?MemberId=' + memberId, {}).subscribe((res) => {
      if (res.status === 1) {

        this.toast.success("Successfully deleted", 2000);
     
        this.settingReset()
      }
    })

  }

  settingReset() {
    this.allVar.map((val) => {
      this.root?.style.setProperty(val.name, val.value);
    })

    let bodyClass: any = document.body.classList;
    let getAllClass = new Array(...bodyClass)

    getAllClass.forEach((val: any) => {
      bodyClass.remove(val);
    });

    this.acsbSettings = {
      id: this.acsbSettings.id,
      epilepsySafeMode: false,
      visuallyImpairedMode: false,
      cognitiveDisabilityMode: false,
      ADHDFriendlyMode: false,
      blindnessMode: false,
      muteSounds: false,
      hideImages: false,
      virtualKeyboard: false,
      readingGuide: false,
      stopAnimations: false,
      readingMask: false,
      highlightHover: false,
      highlightFocus: false,
      bigBlackCursor: false,
      bigWhiteCursor: false,
      navigationKeys: false,
      textMagnifier: false,
      readableFont: false,
      dyslexiaFriendly: false,
      highlightTitles: false,
      highlightLinks: false,
      textSpeech: false,
      themeColor: '',
      textColor: '',
      titleColor: '',
      bgColor: '',
      textAlign: '',
      contentScaling: {
        value: '',
        percent: 0
      },
      fontSize: {
        value: '',
        percent: 0
      },
      lineHeight: {
        value: '',
        percent: 0
      },
      letterSpacing: {
        value: '',
        percent: 0,
      }
    }

  }

  save(apiObj: any) {
    this.acsbSettings.id === 0 ? this.saveSetting(apiObj, 'createdDate') : this.saveSetting(apiObj, 'updatedDate')
  }

  saveSetting(apiObj: any, key: string) {

    let Settings = { ...this.acsbSettings };
    Object.assign(Settings, {
      "memberId": apiObj.memberId,
      "appName": "AngularAPP",
      "isActive": true,
      "isDeleted": false,
      [key]: '' + new Date().toISOString().slice(0, 10),
    })
    this.api.apiPost('Master/AddUpdateAngAppSettings', Settings).subscribe((res) => {
      if (res.status === 1) {
          this.toast.success("Successfully saved", 2000);

      }
    })
  }

  checkSetting(memberIndex: string) {

    this.api.getAll('Master/GetAngAppSettings?MemberId=' + memberIndex).subscribe((res) => {

      if (res.status === 1) {

        if (!res.angAppSettings.isDeleted) {
          res.angAppSettings.id ? this.acsbSettings.id = res.angAppSettings.id : '';

          res.angAppSettings.readableFont ? this.changeFont('Readable') : '';
          res.angAppSettings.hideImages ? this.hideImages() : '';
          res.angAppSettings.muteSounds ? this.acsbSettings.muteSounds = true : '';
          res.angAppSettings.highlightFocus ? this.highlightFocus() : '';
          res.angAppSettings.highlightHover ? this.highlightHover() : '';
          res.angAppSettings.highlightLinks ? this.highlight('--highLightLink') : '';
          res.angAppSettings.highlightTitles ? this.highlight('--highLightTitle') : '';
          res.angAppSettings.readingGuide ? this.acsbSettings.readingGuide = true : '';
          res.angAppSettings.readingMask ? this.acsbSettings.readingMask = true : '';
          res.angAppSettings.stopAnimations ? this.stopAnimation() : '';
          res.angAppSettings.textMagnifier ? this.acsbSettings.textMagnifier = true : '';
          res.angAppSettings.textSpeech ? this.acsbSettings.textSpeech = true : '';
          res.angAppSettings.virtualKeyboard ? this.acsbSettings.virtualKeyboard = true : '';
          res.angAppSettings.bigBlackCursor ? this.cursorChange('big-black-cursor', 'bigBlackCursor') : '';
          res.angAppSettings.bigWhiteCursor ? this.cursorChange('big-white-cursor', 'bigWhiteCursor') : '';

          if (res.angAppSettings.themeColor === 'dark') {
            this.darkMode()
          }
          else if (res.angAppSettings.themeColor === 'light') {
            this.lightMode()
          }
          else if (res.angAppSettings.themeColor) {
            this.saturation(res.angAppSettings.themeColor)
          }


          if (res.angAppSettings.textAlign) {
            this.textAlign.map((key) => {
              this.setVeriableValue(key.name, res.angAppSettings.textAlign)
            })
            this.acsbSettings.textAlign = res.angAppSettings.textAlign;

          }
          res.angAppSettings.textColor ? this.changeColor('text', '--textClr', res.angAppSettings.textColor) : '';
          res.angAppSettings.titleColor ? this.changeColor('title', '--titleClr', res.angAppSettings.titleColor) : '';
          res.angAppSettings.bgColor ? this.changeColor('bg', '--bgClr', res.angAppSettings.bgColor) : '';

          let objKey = [
            { key: 'contentScaling', var: '--zoom' },
            { key: 'lineHeight', var: '--lineHeight' },
            { key: 'letterSpacing', var: '--letterSpacing' },
            { key: 'fontSize', var: 'fontSize' },
          ]

          objKey.map((val: any) => {
            if (res.angAppSettings[val.key].percent !== 0) {
              this.setVeriableValue(val.var, `${res.angAppSettings[val.key].value}`);
              this.acsbSettings[val.key] = {
                value: res.angAppSettings[val.key].value,
                percent: res.angAppSettings[val.key].percent,
              }

              if (val.key === 'fontSize') {
                this.fontVar.map((fontvar) => {
                  var bodyFont: any = this.getVariableValue(fontvar).replace('px', '');
                  let getFontValue = res.angAppSettings[val.key].value.replace('px', '');
                  let incSize = Number(getFontValue) - 12 + Number(bodyFont);
                  this.setVeriableValue(fontvar, `${incSize}px`)
                })
              }
            }
          })

          res.angAppSettings.epilepsySafeMode ? this.acsbSettings.epilepsySafeMode = true : '';
          res.angAppSettings.visuallyImpairedMode ? this.acsbSettings.visuallyImpairedMode = true : '';
          res.angAppSettings.cognitiveDisabilityMode ? this.acsbSettings.cognitiveDisabilityMode = true : '';
          res.angAppSettings.ADHDFriendlyMode ? this.acsbSettings.ADHDFriendlyMode = true : '';
          res.angAppSettings.blindnessMode ? this.acsbSettings.blindnessMode = true : '';

        }
        else {
          res.angAppSettings.id ? this.acsbSettings.id = res.angAppSettings.id : '';
          this.settingReset()
        }
      }



    })

  }


  getVariableValue(variableName: any) {
    return window.getComputedStyle(document.body).getPropertyValue(variableName).trim()
  }

  setVeriableValue(key: string, value: any) {
    this.root?.style.setProperty(key, value);
  }

  classAddAndRemove(key: String, objKey: string) {
    let bodyClass: any = document.body.classList;
    if (bodyClass.contains(key)) {
      bodyClass.remove(key);
      this.acsbSettings[objKey] = false;
    }
    else {
      bodyClass.add(key);
      this.acsbSettings[objKey] = true;
    }
  }

  getSelectedText() {
    var selectedText;
    if (window.getSelection()?.toString().length) {
      selectedText = window.getSelection()?.toString();
    } else if (window.document.getSelection()?.toString().length) {
      selectedText = window.document.getSelection()?.toString();
    }
    return selectedText;
  }

  

}
