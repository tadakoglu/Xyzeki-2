import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

environment.production = true;
// if (environment.production) {
//   enableProdMode();
// }


enableProdMode();


// // uncomment below for web
platformBrowserDynamic().bootstrapModule(AppModule)
.catch(err => console.error(err));


// uncomment below for cordova

// let onDeviceReady = () => {
//   platformBrowserDynamic().bootstrapModule(AppModule)
//     .catch(err => console.error(err));
// };

// document.addEventListener('deviceready', onDeviceReady, false);