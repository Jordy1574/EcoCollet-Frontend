import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

console.log('🚀 Iniciando Angular...');

bootstrapApplication(AppComponent, appConfig)
  .then(() => {
    console.log('✅ Angular cargado exitosamente!');
  })
  .catch(err => {
    console.error('❌ Error cargando Angular:', err);
  });
