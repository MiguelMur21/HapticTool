import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { Router, NavigationEnd } from '@angular/router';
import * as Plotly from 'plotly.js-dist-min';
import { FooterComponent } from "./components/footer/footer.component";
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Haptictool';

   isLoginPage = false;

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // ✅ si la URL actual es /login, oculta el header
        this.isLoginPage = event.urlAfterRedirects.startsWith('/inicio-sesión');
      }
    });
  }
}
