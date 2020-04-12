import { Component, OnInit, Inject } from '@angular/core';
import { HumanReadableProgram, VariableDescription } from 'ccbl-js/lib/ProgramObjectInterface';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Sensor } from '../data/setup';

export interface DataEnvGenerator {
  program: HumanReadableProgram;
  events: VariableDescription[];
  emitters: VariableDescription[];
  channels: VariableDescription[];
}

@Component({
  selector: 'app-env-generator',
  templateUrl: './env-generator.component.html',
  styleUrls: ['./env-generator.component.scss']
})
export class EnvGeneratorComponent implements OnInit {
  sensors: Sensor[] = [];

  constructor( private dialogRef: MatDialogRef<EnvGeneratorComponent, Sensor[]>
             , @Inject(MAT_DIALOG_DATA) private data: DataEnvGenerator
             ) {
  }

  ngOnInit(): void {
  }

  ok() {
    this.dialogRef.close( this.sensors );
  }

  cancel() {
    this.dialogRef.close();
  }

}
