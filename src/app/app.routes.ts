import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { MainLayout } from './layouts/main-layout/main-layout';

const guarded = { canActivate: [authGuard], data: { roles: ['ACTIVE', 'LOCAL', 'GLOBAL'] } };

export const routes: Routes = [
  // Chat: full screen, no header/footer
  {
    path: 'app',
    loadComponent: () => import('./components/chat-layout/chat-layout').then((m) => m.ChatLayout),
    ...guarded,
  },
  {
    path: 'app/:id',
    loadComponent: () => import('./components/chat-layout/chat-layout').then((m) => m.ChatLayout),
    ...guarded,
  },

  {
    path: '',
    component: MainLayout,
    ...guarded,
    children: [
      { path: '', loadComponent: () => import('./components/analyze-profile/analyze-profile').then((m) => m.AnalyzeProfile) },
      { path: 'analyze-profile', loadComponent: () => import('./components/analyze-profile/analyze-profile').then((m) => m.AnalyzeProfile) },
      { path: 'grant-list', loadComponent: () => import('./components/grant-list/grant-list').then((m) => m.GrantList) },
      { path: 'plans', loadComponent: () => import('./components/plans/plans').then((m) => m.Plans) },
      { path: 'invoices', loadComponent: () => import('./components/invoices/invoices').then((m) => m.Invoices) },
      { path: 'ai/payment-success', loadComponent: () => import('./components/payment-success/payment-success').then((m) => m.PaymentSuccess) },
      { path: 'ai/payment-failed', loadComponent: () => import('./components/payment-failed/payment-failed').then((m) => m.PaymentFailed) },
    ],
  },

  { path: '**', redirectTo: '' },
];
