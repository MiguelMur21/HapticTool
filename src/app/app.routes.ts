import { Routes } from '@angular/router';
import { AboutUsComponent } from './components/about-us/about-us.component';
import { GraphicsComponent } from './components/graphics/graphics.component';
import { UploadFilesComponent } from './components/upload-files/upload-files.component';
import { LoginComponent } from './profile/login/login.component';
import { RegisterComponent } from './profile/register/register.component';
export const routes: Routes = [
    {path: '', component: AboutUsComponent},
    {path: 'graficas', component: GraphicsComponent},
    {path: 'cargar-archivos', component: UploadFilesComponent},
    {path: 'Inicio-sesión', component: LoginComponent},
    {path: 'Registro', component: RegisterComponent},
];
