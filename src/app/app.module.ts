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
import { SceneAvatarComponent } from './sceneAvatar/scene-avatar.component';
import { DndModule } from 'ngx-drag-drop';
import { PeopleComponent } from './people/people.component';
import { AppartmentComponent } from './appartment/appartment.component';
import { DeviceComponent } from './device/device.component';
import { DeviceLampComponent } from './device-lamp/device-lamp.component';
import {SceneHeatingComponent} from './scene-heating/scene-heating.component';
import {MatTabsModule} from '@angular/material/tabs';
import { ClockComponent } from './clock/clock.component';
import {DatePipe} from "@angular/common";
import { ClockDisplayComponent } from './clock-display/clock-display.component';

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
        SceneAvatarComponent,
        SceneHeatingComponent,
        PeopleComponent,
        AppartmentComponent,
        DeviceComponent,
        DeviceLampComponent,
        ClockComponent,
        ClockDisplayComponent,
    ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    DndModule,
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
    MatRadioModule,
    MatTabsModule
  ],
  providers: [DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
