import {NgModule, Pipe, PipeTransform} from '@angular/core';
import { CcblGfx9Component } from './ccbl-gfx9.component';
import {EditableLabelComponent} from './editable-label/editable-label.component';
import {VarDeclarationComponent} from './var-declaration/var-declaration.component';
import {CcblContextOrProgramComponent} from './ccbl-context-or-program/ccbl-context-or-program.component';
import {CcblStateContextComponent} from './ccbl-state-context/ccbl-state-context.component';
import {CcblActionStateComponent} from './ccbl-action-state/ccbl-action-state.component';
import {CcblExpressionComponent} from './ccbl-expression/ccbl-expression.component';
import {CcblEventContextComponent} from './ccbl-event-context/ccbl-event-context.component';
import {CcblEventChannelActionComponent} from './ccbl-event-channel-action/ccbl-event-channel-action.component';
import {CcblEventTriggerActionComponent} from './ccbl-event-trigger-action/ccbl-event-trigger-action.component';
import {EditableOptionComponent} from './editable-option/editable-option.component';
import {CcblProgramReferenceComponent} from './ccbl-program-reference/ccbl-program-reference.component';
import {DomSanitizer} from '@angular/platform-browser';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {CcblGfx9Service} from './ccbl-gfx9.service';
import {ClipboardService} from './clipboard.service';
import {DndModule} from 'ngx-drag-drop';
import { DialogTriggerComponent } from './dialog-trigger/dialog-trigger.component';
import {MatToolbarModule} from '@angular/material/toolbar';
import { DialogActionEventComponent } from './dialog-action-event/dialog-action-event.component';
import { DialogEditContextStateConditionComponent } from './dialog-edit-context-state-condition/dialog-edit-context-state-condition.component';
import { CcblEventExpressionComponent } from './ccbl-event-expression/ccbl-event-expression.component';
import { DialogEditExpressionComponent } from './dialog-edit-expression/dialog-edit-expression.component';
import { DialogEditActionStateComponent } from './dialog-edit-action-state/dialog-edit-action-state.component';
import { EditProgramDescrComponent } from './edit-program-descr/edit-program-descr.component';
import { CcblProgramApiComponent } from './ccbl-program-api/ccbl-program-api.component';
import { CcblVariableDescriptionComponent } from './ccbl-variable-description/ccbl-variable-description.component';
import { DialogAppendDependencyComponent } from './dialog-append-dependency/dialog-append-dependency.component';
import { DialogEditSubProgramComponent } from './dialog-edit-sub-program/dialog-edit-sub-program.component';
import { DialogEditProgInstanceComponent } from './dialog-edit-prog-instance/dialog-edit-prog-instance.component';
import { ProgInstanceParametersComponent } from './prog-instance-parameters/prog-instance-parameters.component';
import { EmptyProxyCcblProgService } from './empty-proxy-ccbl-prog.service';
import {ProxyCcblProg} from "./ProxyCcblProg";
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';

@Pipe({ name: 'safeHtml'})
export class SafeHtmlPipe implements PipeTransform  {
  constructor(private sanitized: DomSanitizer) {}
  transform(value: string) {
    return this.sanitized.bypassSecurityTrustHtml(value);
  }
}


@NgModule({
  declarations: [
    CcblGfx9Component,
    VarDeclarationComponent,
    CcblContextOrProgramComponent,
    CcblStateContextComponent,
    CcblActionStateComponent,
    CcblExpressionComponent,
    SafeHtmlPipe,
    CcblEventContextComponent,
    CcblEventChannelActionComponent,
    CcblEventTriggerActionComponent,
    EditableLabelComponent,
    EditableOptionComponent,
    CcblProgramReferenceComponent,
    DialogTriggerComponent,
    DialogActionEventComponent,
    DialogEditContextStateConditionComponent,
    CcblEventExpressionComponent,
    DialogEditExpressionComponent,
    DialogEditActionStateComponent,
    EditProgramDescrComponent,
    CcblProgramApiComponent,
    CcblVariableDescriptionComponent,
    DialogAppendDependencyComponent,
    DialogEditSubProgramComponent,
    DialogEditProgInstanceComponent,
    ProgInstanceParametersComponent
  ],
    imports: [
        CommonModule,
        FormsModule,
        MatMenuModule,
        DndModule,
        MatButtonModule,
        MatToolbarModule,
        MatSelectModule,
        MatCheckboxModule,
        MatTabsModule,
        MatInputModule
    ],
  exports: [CcblGfx9Component],
  providers: [
    CcblGfx9Service,
    ClipboardService,
    { provide: ProxyCcblProg, useClass: EmptyProxyCcblProgService }
  ],
})
export class CcblGfx9Module { }
