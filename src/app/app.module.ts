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
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import { DialogDeviceComponent } from './dialog-device/dialog-device.component';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatStepperModule} from '@angular/material/stepper';
import { EventerComponent } from './eventer/eventer.component';
import { EnvGeneratorComponent } from './env-generator/env-generator.component';
import { SceneAvatarComponent } from './sceneAvatar/scene-avatar.component';
import { DndModule } from 'ngx-drag-drop';
import { PeopleComponent } from './people/people.component';
import { AppartmentComponent } from './appartment/appartment.component';
import { DeviceComponent } from './device/device.component';
import { DeviceLampComponent } from './device-lamp/device-lamp.component';
import {SceneHeatingComponent} from './scene-heating/scene-heating.component';
import {DatePipe} from "@angular/common";
import { ClockDisplayComponent } from './clock-display/clock-display.component';
import { SceneHomeComponent } from './scene-house/scene-house.component';
import { DialogAppendVar, DialogLoadProg, TestEditorVerifComponent } from './test-editor-verif/test-editor-verif.component';
import { DialogAppendVariableComponent } from './test-editor-verif/dialog-append-variable/dialog-append-variable.component';
import { DemoComponent } from './demo/demo.component';
import { initializeApp,provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideAuth,getAuth } from '@angular/fire/auth';
import { provideFirestore,getFirestore } from '@angular/fire/firestore';
import { LoginComponent } from './login/login.component';
import { AdminComponent } from './admin/admin.component';
import { ExperimentateurComponent } from './experimentateur/experimentateur.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import {MatButtonModule} from '@angular/material/button';
import {MatListModule} from '@angular/material/list';
import {MatRadioModule} from '@angular/material/radio';
import {MatAutocompleteModule} from '@angular/material/autocomplete';

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
        ClockDisplayComponent,
        SceneHomeComponent,
        TestEditorVerifComponent,
        DialogAppendVariableComponent,
        DialogAppendVar, DialogLoadProg, DemoComponent, LoginComponent, AdminComponent, ExperimentateurComponent,
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
    ReactiveFormsModule,
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
    MatTabsModule,
    MatAutocompleteModule,
    // NgbModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore())
  ],
  providers: [DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }

