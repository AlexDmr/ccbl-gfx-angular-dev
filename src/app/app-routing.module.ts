import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { AuthAdminGuard } from './auth-admin.guard';
import { AuthExpeGuard } from './auth-expe.guard';
import { DemoComponent } from './demo/demo.component';
import { ExperimentateurComponent } from './experimentateur/experimentateur.component';
import { LoginComponent } from './login/login.component';


const routes: Routes = [
  { path: 'demo', component: DemoComponent },
  { path: 'login', component: LoginComponent },
  { path: 'admin', component: AdminComponent, canActivate: [AuthAdminGuard],
    children: []
  },
  { path: 'experimentateur', component: ExperimentateurComponent, canActivate: [AuthExpeGuard],
    children: []
  },
  { path: "**", component: LoginComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
