import { Routes } from '@angular/router';
import { AboutUsComponent } from './components/about-us/about-us.component';
import { GraphicsComponent } from './components/graphics/graphics.component';
import { UploadFilesComponent } from './components/upload-files/upload-files.component';
import { LoginComponent } from './profile/login/login.component';
import { RegisterComponent } from './profile/register/register.component';
import { NormalUserComponent } from './pages/normal-user/normal-user.component';
import { AdminComponent } from './pages/admin/admin.component';
import { SuperadminComponent } from './pages/superadmin/superadmin.component';
import { authGuard } from './guards/auth.guard';
import { AdminUsersComponent } from './pages/superadmin/admin-users/admin-users.component';
import { AdminArchiveComponent } from './pages/superadmin/admin-archive/admin-archive.component';
import { AdminLogComponent } from './pages/superadmin/admin-log/admin-log.component';
export const routes: Routes = [
 // 🌐 Página pública
  { path: '', component: AboutUsComponent },
  { path: 'graficas', component: GraphicsComponent },
  { path: 'cargar-archivos', component: UploadFilesComponent },
  { path: 'Inicio-sesión', component: LoginComponent },
  { path: 'Registro', component: RegisterComponent },

  // 👤 Usuarios normales y administradores
  { path: 'usuario', component: NormalUserComponent },
  { path: 'admin', component: AdminComponent },

  // 👑 Superadministrador con subrutas
  {
    path: 'administrador',
    component: SuperadminComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'usuarios', pathMatch: 'full' }, // ruta por defecto
      { path: 'usuarios', component: AdminUsersComponent },
      { path: 'archivos', component: AdminArchiveComponent },
      { path: 'logs', component: AdminLogComponent }
    ]
  },

  // 🚧 Ruta por defecto (404)
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
