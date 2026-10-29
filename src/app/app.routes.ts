import { Routes } from '@angular/router';

import { LoginComponent } from './northwind-ui/login/login.component';
import { DashComponent } from './northwind-ui/dash/dash.component';
import { authGuard } from './utilities/guards/auth.guard';

import { Error404Component } from './shared/error/error404/error404.component';
import { Error500Component } from './shared/error/error500/error500.component';

export const routes: Routes = [

  // Default route → login
  { path: '', component: LoginComponent },

  // Dashboard (resolver made safe in code)
  { 
    path: 'dashboard', 
    component: DashComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'territories',
    loadComponent: () => import('./northwind-ui/territory-map/territory-map.component')
      .then(m => m.TerritoryMapComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'admin',
    loadComponent: () => import('./admin/admin-user-panel/admin-user-panel.component')
      .then(m => m.AdminUserPanelComponent),
    canActivate: [authGuard]
  },
  // Products + children
  { 
    path: 'products',
    loadComponent: () => import('./northwind-ui/products/product-table/product-table.component')
      .then(m => m.ProductTableComponent),
    canActivate: [authGuard],
    children: [
      { path: 'details/new', loadComponent: () => import('./northwind-ui/products/product-table/product-table-detail/product-table-detail.component').then(m => m.ProductTableDetailComponent) },
      { path: 'details/:id', loadComponent: () => import('./northwind-ui/products/product-table/product-table-detail/product-table-detail.component').then(m => m.ProductTableDetailComponent) },
      { path: 'summary',     loadComponent: () => import('./northwind-ui/products/product-summary/product-summary.component').then(m => m.ProductSummaryComponent) }
    ]
  },

  // Error pages (NO GUARDS)
  { path: '404', component: Error404Component },
  { path: '500', component: Error500Component },

  {
    path: 'auth/callback',
    loadComponent: () => import('./auth-callback/auth-callback.component').then(m => m.AuthCallbackComponent)
  },

  // Wildcard → 404 (NOT dashboard)
  { path: '**', component: Error404Component }
];