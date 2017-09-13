import {
  Component,
  ViewEncapsulation
} from '@angular/core';
import {
  WidgetRegistry,
  Validator,
  DefaultWidgetRegistry
} from './lib';

@Component({
  selector: 'sf-demo-app',
  templateUrl: './app.component.html',
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: WidgetRegistry, useClass: DefaultWidgetRegistry }]
})
export class AppComponent {

  schema: any;
  model: any;

  constructor(registry: WidgetRegistry) {

    // this.schema = require('./sampleschema.json');
    // this.model = require('./samplemodel.json');
    this.model = {};
    this.schema = {
      type: 'object',
      properties: {
        valami: {
          type: 'string'
        },
        array: {
          type: 'array',
          items: {
            type: 'string'
          }
        }
      },
      fieldsets: [
        {
          "fields": [
            "valami",
            "array"
          ],
          "id": "default",
          "title": "Default"
        }
      ],
    };

  }
}
