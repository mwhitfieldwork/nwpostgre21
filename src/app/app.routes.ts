import { Routes } from '@angular/router';

import { LoginComponent } from './northwind-ui/login/login.component';
import { DashComponent } from './northwind-ui/dash/dash.component';
import { ProductTableComponent } from './northwind-ui/products/product-table/product-table.component';
import { ProductTableDetailComponent } from './northwind-ui/products/product-table/product-table-detail/product-table-detail.component';
import { authGuard } from './utilities/guards/auth.guard';

import { Error404Component } from './shared/error/error404/error404.component';
import { Error500Component } from './shared/error/error500/error500.component';
import { TerritoryMapComponent } from './northwind-ui/territory-map/territory-map.component';
import { ProductSummaryComponent } from './northwind-ui/products/product-summary/product-summary.component';
import { AdminUserPanelComponent } from './admin/admin-user-panel/admin-user-panel.component';

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
    component: TerritoryMapComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'admin', 
    component: AdminUserPanelComponent,
    canActivate: [authGuard]
  },
  // Products + children
  { 
    path: 'products', 
    component: ProductTableComponent,
    canActivate: [authGuard],
    children: [
      { path: 'details/new', component: ProductTableDetailComponent },
      { path: 'details/:id', component: ProductTableDetailComponent },
      { path: 'summary', component: ProductSummaryComponent }
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