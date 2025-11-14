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
  // 🌐 Páginas públicas
  { path: '', component: AboutUsComponent },
  { path: 'Inicio-sesión', component: LoginComponent },
  { path: 'Registro', component: RegisterComponent },

  // 🔐 Páginas protegidas por autenticación (cualquier usuario logueado)
  { 
    path: 'graficas', 
    component: GraphicsComponent,
    canActivate: [authGuard] // Cualquier usuario autenticado
  },

  // 🔒 Páginas protegidas por ROL
  { 
    path: 'cargar-archivos', 
    component: UploadFilesComponent,
    canActivate: [authGuard],
    data: { roles: ['admin', 'super_admin'] } // Solo admin y super_admin
  },

  // 👤 Ruta específica para usuario normal
  {
    path: 'usuario',
    component: NormalUserComponent,
    canActivate: [authGuard],
    data: { roles: ['usuario_normal'] }
  },

  // 🧩 Ruta específica para administrador
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [authGuard],
    data: { roles: ['admin'] }
  },

  // 👑 Panel de Superadministrador (SOLO super_admin)
  {
    path: 'administrador',
    component: SuperadminComponent,
    canActivate: [authGuard],
    data: { roles: ['super_admin'] },
    children: [
      { path: '', redirectTo: 'usuarios', pathMatch: 'full' },
      { 
        path: 'usuarios', 
        component: AdminUsersComponent,
        data: { roles: ['super_admin'] } // 🔥 IMPORTANTE: Proteger hijos también
      },
      { 
        path: 'archivos', 
        component: AdminArchiveComponent,
        data: { roles: ['super_admin'] }
      },
      { 
        path: 'logs', 
        component: AdminLogComponent,
        data: { roles: ['super_admin'] }
      }
    ]
  },

  // 🚧 Ruta por defecto (404)
  { path: '**', redirectTo: '', pathMatch: 'full' }
];