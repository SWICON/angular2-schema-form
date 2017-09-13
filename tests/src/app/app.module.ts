import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { SchemaFormModule } from './lib';
import { AppComponent } from './app.component';
import {SchemaValidatorFactory} from './lib/schemavalidatorfactory';
import {ZSchemaValidatorFactory} from './lib/schemavalidatorfactory';
import {WidgetRegistry} from './lib/widgetregistry';
import {DefaultWidgetRegistry} from './lib/defaultwidgets/defaultwidgetregistry';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    SchemaFormModule,
    HttpModule
  ],
  providers: [
    {
      provide: SchemaValidatorFactory,
      useClass: ZSchemaValidatorFactory
    },
    {
      provide: WidgetRegistry,
      useClass: DefaultWidgetRegistry
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
