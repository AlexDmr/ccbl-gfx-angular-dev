import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {CcblGfx9Module} from '../../projects/ccbl-gfx9/src/lib/ccbl-gfx9.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {SensorBooleanComponent} from './sensor-boolean/sensor-boolean.component';
import {SensorColorComponent} from './sensor-color/sensor-color.component';
import {SensorComponent} from './sensor/sensor.component';
import {SensorScalarComponent} from './sensor-scalar/sensor-scalar.component';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {FormsModule} from '@angular/forms';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import { DialogDeviceComponent } from './dialog-device/dialog-device.component';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatStepperModule} from '@angular/material/stepper';
import {MatRadioModule} from '@angular/material/radio';
import { EventerComponent } from './eventer/eventer.component';
import { EnvGeneratorComponent } from './env-generator/env-generator.component';
import { SceneComponent } from './scene/scene.component';

@NgModule({
  declarations: [
    AppComponent,
    SensorBooleanComponent,
    SensorColorComponent,
    SensorComponent,
    SensorScalarComponent,
    DialogDeviceComponent,
    EventerComponent,
    EnvGeneratorComponent,
    SceneComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CcblGfx9Module,
    BrowserAnimationsModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatToolbarModule,
    MatCheckboxModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatDialogModule,
    MatInputModule,
    MatListModule,
    MatGridListModule,
    MatStepperModule,
    MatRadioModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
