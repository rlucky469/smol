export const environment = {
  
  production: false,
  // ApiUrl : 'https://testenv.fundsforngospremium.com/api/',
  // ApiUrl1 : 'https://testenv.fundsforngospremium.com/',
  APIURL:"https://ffn-chatbot-premium-backend-production.up.railway.app/",
     APIKEY : 'your_api_key_for_server_to_server_calls',
   ApiUrl : 'https://core.fundsforngospremium.com/api/',
   ApiUrl1 : 'https://core.fundsforngospremium.com/',
   USApiUrl: 'https://us-premium.grantsforus.app/',
    ProposalDomain: 'http://localhost:3010/',
   nodeApiUrl : 'https://research.grantsforus.app/api',

  // Chat backend (merged from chat_ai project)
  chatApiUrl: 'https://ffn-chatbot-premium-backend-production.up.railway.app/',
  chatApiKey: 'your_api_key_for_server_to_server_calls',


  loginDomain: 'https://login.fundsforngospremium.com/',
  dashboardDomain: 'http://localhost:3002/',
  grantsDomain: 'http://localhost:3000/',
  resourcesDomain: 'http://localhost:3003/',
  coursesDomain: 'http://localhost:3004/',
  articleDomain: 'http://localhost:3005/',
  donorProfileDomain: 'http://localhost:3006/',
  jobDomain: 'http://localhost:3007/',
  newsDomain: 'http://localhost:3008/',
  helpDomain: 'http://localhost:3009/',
  ErrorMsg: 'Internal Server Error',

  cookieExpTime: 90,
  domain: 'localhost',
  token: '_USR_ACCESSTOKEN_',
  refreshToken: 'refreshToken',
  tokenKey: 'NgoUserToken!',
  user: '_USR_AUTH_',
  userKey: 'NgoUserAuthKey!',
  viwe: '_USR_VIEWTYPE_',
  viweKey: 'NgoviewType!',
  submitUrl: '_Submit_Url_',
  excludedCookieNames: ['_ALRT_PREF_DAY_', 'REMIND_LATER', '_ALRT_PREF_isViewed_', 'Widgets'],
  trialUserMsg: 'Upgrade now to save preferences & receive funding alerts via email. Click Upgrade Now button to start',

  USFullSiteSearchUrl: 'https://webapi.grantsforus.app/api/Premium/GetUsGrantsPaging',
  FullSiteSearchUrl: 'https://search.fundsforngospremium.com/api/Search/FullSiteSearch',

  urlObj() {
    return {
      "OP": this.grantsDomain + 'opportunity/op/',
      "FN": this.donorProfileDomain + 'donordatabase/fn/',
      "BL": this.donorProfileDomain + 'donordatabase/bl/',
      "SP": this.resourcesDomain + 'sampleproposal/sp/',
      "DL": this.resourcesDomain + 'download/dl/',
      "VD": this.resourcesDomain + 'trainingvideos/tv/',
      "JB": this.jobDomain + 'jobs/jb/',
      "FA": this.articleDomain + 'article/fa/',
      "NS": this.resourcesDomain + 'news/ns/',
      "CR": this.coursesDomain + 'courses/tc/',
      "US-OP": this.grantsDomain + 'opportunity/us-op/'
    }
  },

  defaultImgPath() {
    return {
      OP: "https://s3.amazonaws.com/cdn.ffnpremium/default-images/default-funding-opportunity.jpg",
      "US-OP": "https://s3.amazonaws.com/cdn.ffnpremium/default-images/default-funding-opportunity.jpg",
      SP: "https://s3.amazonaws.com/cdn.ffnpremium/default-images/default-sample-proposal.png",
      DL: "https://s3.amazonaws.com/cdn.ffnpremium/default-images/default-ebook.png",
      JB: "https://s3.amazonaws.com/cdn.ffnpremium/default-images/default-job.png",
      FA: 'https://s3.amazonaws.com/cdn.ffnpremium/default-images/default-featured-article.jpg',
      CR: '../assets/course.png',
      VD: 'https://s3.amazonaws.com/cdn.ffnpremium/default-images/default-training-video.png'
    }
  },

  cookieKey : 'b14ca5898a4e4133bbce2ea2315a1916',
  defaultImage:  'https://s3.amazonaws.com/cdn.ffnpremium/default-images/default-funding-opportunity.jpg',
  razorPaykey:'rzp_live_RPrsJJvAlEwd89',




};
