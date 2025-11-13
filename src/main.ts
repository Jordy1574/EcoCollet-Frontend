import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

console.log('🚀 Iniciando Angular con Azure Backend...');

bootstrapApplication(AppComponent, appConfig)
  .then(() => {
    console.log('✅ Angular cargado exitosamente con producción!');
  })
  .catch(err => {
    console.error('❌ Error cargando Angular:', err);
  });
