import { ApplicationConfig, isDevMode, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideRouterStore, routerReducer } from '@ngrx/router-store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { CookieService } from 'ngx-cookie-service';

import { routes } from './app.routes';
import { httpconfigInterceptor } from './core/interceptors/httpconfig.interceptor';
import { errorInterceptor } from './core/interceptors/error-interceptor';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';

import { chatReducer } from './store/chat/chat.reducer';
import { conversationReducer } from './store/conversation/conversation.reducer';
import { walletReducer } from './store/wallet/wallet.reducer';
import { plansReducer } from './store/plans/plans.reducer';
import { invoicesReducer } from './store/invoices/invoices.reducer';
import { grantsReducer } from './store/grants/grants.reducer';

import { ChatEffects } from './store/chat/chat.effects';
import { ConversationEffects } from './store/conversation/conversation.effects';
import { WalletEffects } from './store/wallet/wallet.effects';
import { PlansEffects } from './store/plans/plans.effects';
import { InvoicesEffects } from './store/invoices/invoices.effects';
import { GrantsEffects } from './store/grants/grants.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    CookieService,

    provideHttpClient(
      withInterceptors([
        httpconfigInterceptor,
        errorInterceptor,
        jwtInterceptor
      ])
    ),

    provideRouter(routes),

    provideStore({
      router: routerReducer,
      chat: chatReducer,
      conversation: conversationReducer,
      wallet: walletReducer,
      plans: plansReducer,
      invoices: invoicesReducer,
      grants: grantsReducer,
    }),
    provideEffects(
      ChatEffects,
      ConversationEffects,
      WalletEffects,
      PlansEffects,
      InvoicesEffects,
      GrantsEffects,
    ),
    provideRouterStore(),

    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      trace: true,
      traceLimit: 75,
    }),
  ]
};
