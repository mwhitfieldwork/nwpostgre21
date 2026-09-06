import { Routes } from '@angular/router';

import { LoginComponent } from './northwind-ui/login/login.component';
import { DashComponent } from './northwind-ui/dash/dash.component';
import { ProductTableComponent } from './northwind-ui/products/product-table/product-table.component';
import { ProductTableDetailComponent } from './northwind-ui/products/product-table/product-table-detail/product-table-detail.component';

import { Error404Component } from './shared/error/error404/error404.component';
import { Error500Component } from './shared/error/error500/error500.component';
import { TerritoryMapComponent } from './northwind-ui/territory-map/territory-map.component';
import { DashboardResolver } from './utilities/resolvers/dashboard-resolver.resolver';
import { ProductSummaryComponent } from './northwind-ui/products/product-summary/product-summary.component';

export const routes: Routes = [

  // Default route → login
  { path: '', component: LoginComponent },

  // Dashboard (resolver made safe in code)
  { 
    path: 'dashboard', 
    component: DashComponent,
    resolve: { data: DashboardResolver }
  },
  { 
    path: 'territories', 
    component: TerritoryMapComponent
  },
  // Products + children
  { 
    path: 'products', 
    component: ProductTableComponent,
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