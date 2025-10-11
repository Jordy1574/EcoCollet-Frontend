import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

console.log('🚀 Iniciando Angular...');

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes)
  ]
}).then(() => {
  console.log('✅ Angular cargado exitosamente!');
}).catch(err => {
  console.error('❌ Error cargando Angular:', err);
});
