import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ProgVersionner } from 'projects/ccbl-gfx9/src/public-api';
import { HumanReadableProgram } from 'ccbl-js/lib/ProgramObjectInterface';
import { ActionsPath } from '../../../projects/ccbl-gfx9/src/lib/smt.definitions';
import { BehaviorSubject, combineLatest, map, Observable, startWith } from 'rxjs';
import { SmtService } from 'projects/ccbl-gfx9/src/lib/smt.service';
import { OpenhabService } from './openhab.service';
import { Item } from './openHabItem';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';

interface CCBL_var<T> {
  name: string;
  id: string;
  type: string;
  value: {
    init: T;
    get: (v: T) => string;
    set: (s: string) => T;
  };
  bs: BehaviorSubject<T>;
}


@Component({
  selector: 'app-test-editor-verif',
  templateUrl: './test-editor-verif.component.html',
  styleUrls: ['./test-editor-verif.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestEditorVerifComponent implements OnInit {
  progV: ProgVersionner;
  LAP = new BehaviorSubject<ActionsPath[]>([]);
  bsVar = new BehaviorSubject<CCBL_var<unknown>[]>( [] );



  constructor(private smtService: SmtService, private ohs: OpenhabService, private dialog: MatDialog) {
    const json = localStorage.getItem('TestEditorVerif');
    const P: HumanReadableProgram = json ? JSON.parse(json) : {};
    this.progV = new ProgVersionner( P );
    this.progV.asObservable().subscribe( nP => localStorage.setItem('TestEditorVerif', JSON.stringify(nP)) );
  }

  ngOnInit(): void {
  }

  async validate() {
    const conf = await this.smtService.evalProgram( this.progV.getCurrent() );
    this.LAP.next( conf.LAP );
  }

  get obsItems(): Observable<Item[]> {
    return this.ohs.obsItems;
  }

  initOpenHab(url: string) {
    this.ohs.initConnection(url);
  }

  appendVar(): void {
    this.dialog.open( DialogAppendVar );
  }
}




/**
 * Composant interne pour dialogue ajout de variable
 */
 @Component({
  selector: 'dialog-append-var',
  template: `
    <form class="example-form">
      <mat-form-field>
        <mat-label>Item</mat-label>
        <input type="text"
              placeholder="Pick one"
              aria-label="Number"
              matInput
              [formControl]="myControl"
              [matAutocomplete]="auto">
        <mat-autocomplete #auto="matAutocomplete">
          <mat-option *ngFor="let option of filteredOptions | async" [value]="option">
            {{option}}
          </mat-option>
        </mat-autocomplete>
      </mat-form-field>
    </form>
  `,
  styles: [`
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DialogAppendVar implements OnInit {
  myControl = new FormControl('');
  filteredOptions: Observable<string[]>;

  constructor( private ohs: OpenhabService, public dialogRef: MatDialogRef<DialogAppendVar, CCBL_var<any>>,
    /*@Inject(MAT_DIALOG_DATA) public data: DialogData*/ ) {
      this.filteredOptions = combineLatest( [this.myControl.valueChanges.pipe(startWith('')), ohs.obsItems] ).pipe(
        map( ([value, options]) => this._filter(value ?? '', options))
      )
    }
  
  ngOnInit(): void {   
  }
  
  ok(): void {
    this.dialogRef.close();
  }

  cancel(): void {
    this.dialogRef.close();
  }

  private _filter(value: string, options: Item[]): string[] {
    const filterValue = value.toLowerCase();
    return options.filter(option => (option.label ?? option.name ?? "").toLowerCase().includes(filterValue)).map(o => o.label);
  }

}