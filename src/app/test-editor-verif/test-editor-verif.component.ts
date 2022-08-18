import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ProgVersionner, updateDisplay } from 'projects/ccbl-gfx9/src/public-api';
import { HumanReadableProgram } from 'ccbl-js/lib/ProgramObjectInterface';
import { ActionsPath } from '../../../projects/ccbl-gfx9/src/lib/smt.definitions';
import { BehaviorSubject, combineLatest, delay, firstValueFrom, map, Observable, share, startWith } from 'rxjs';
import { SmtService } from 'projects/ccbl-gfx9/src/lib/smt.service';
import { OpenhabService } from './openhab.service';
import { Item } from './openHabItem';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';

interface CCBL_var<T> {
  readonly label: string;
  readonly id: string;
  readonly type: string;
  readonly next: (v: T) => void;
  readonly obsCCBL: Observable<T>;
  readonly obsEnv: Observable<T>;
}

function getCCBL_var<T>({label, id, type, obsEnv, initialValue, update}: {initialValue: T, label: string, id: string, type: string, obsEnv: Observable<T>, update: (v: T) => void}): CCBL_var<T> {
  const bs = new BehaviorSubject<T>( initialValue );
  const ctrl = combineLatest([obsEnv, bs.pipe(delay(1000))]);
  ctrl.subscribe( ([env, ccbl]) => {
    if (env !== ccbl) {
      update(ccbl);
    }
  });
  return {
    label, id, type,
    next: v => bs.next(v),
    obsCCBL: bs.asObservable(),
    obsEnv
  }
}

interface CONVERTER<T> {
  get: (v: T) => string;
  set: (s: string) => T;
}
const converterSwitch: CONVERTER<boolean> = {
  get: v => v ? "ON" : "OFF",
  set: s => s === "ON",
}
const converterDimmer: CONVERTER<number> = {
  get: n => n.toString(),
  set: s => {
    switch(s) {
      case "ON": return 100;
      case "OFF": return 0;
      default:
        return +s;
    }
  },
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

  async appendVar(res?:  Omit<CCBL_var<any>, "obsCCBL" | "obsEnv" | "next">) {
    if (res === undefined) {
      const dialog = this.dialog.open<DialogAppendVar, never, CCBL_var<unknown> | undefined>( DialogAppendVar );
      res = await firstValueFrom( dialog.afterClosed() );
    }
    console.log( "res =", res );
    if (res) {
      const obsEnv = this.ohs.getObsItems( res.id );
      if (obsEnv) {
        let ccblVar: CCBL_var<any> | undefined = undefined;
        switch (res?.type) {
          case "Dimmer":
            ccblVar = getCCBL_var<number>({
              ...res,
              initialValue: 0,
              update: v => this.ohs.setItem( res!.id, converterDimmer.get(v) ),
              obsEnv: obsEnv.pipe( map( item => converterDimmer.set(item.state) ) )
            });
            break;
        }
        if (ccblVar) {
          this.bsVar.next( [...this.bsVar.value, ccblVar] );
        }
      } else {
        console.error("No observable for item", res);
      }
      
    }
  }

}




/**
 * Composant interne pour dialogue ajout de variable
 */
 @Component({
  selector: 'dialog-append-var',
  template: `
    <mat-toolbar color="primary">
      Append a CCBL variable
    </mat-toolbar>
    <form>
      <mat-form-field>
        <mat-label>Item</mat-label>
        <input type="text"
              placeholder="Pick one"
              aria-label="Number"
              matInput
              [formControl]="itemNameControl"
              [matAutocomplete]="auto">
        <mat-autocomplete #auto="matAutocomplete">
          <mat-option *ngFor="let option of filteredOptions | async" [value]="option.name">
            {{option.label}}
          </mat-option>
        </mat-autocomplete>
      </mat-form-field>
    </form>
    <hr/>
    <button mat-raised-button color="warn" (click)="cancel()">Cancel</button>
    &nbsp;
    <button mat-raised-button color="primary" (click)="ok()">Append</button>
    <hr/>
    <pre>{{allTypes | async | json}}</pre>
  `,
  styles: [`
    form {
      display: flex;
      flex-flow: column;

    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DialogAppendVar implements OnInit {
  itemNameControl = new FormControl('', {nonNullable: true});
  typeControl = new FormControl<"boolean" | "number" | "string">('string', {nonNullable: true});
  filteredOptions: Observable<Item[]>;
  allTypes: Observable<string[]>;

  constructor( private ohs: OpenhabService, public dialogRef: MatDialogRef<DialogAppendVar, Omit<CCBL_var<any>, "obsCCBL" | "obsEnv" | "next">>,
    /*@Inject(MAT_DIALOG_DATA) public data: DialogData*/ ) {
      this.filteredOptions = combineLatest( [
        this.itemNameControl.valueChanges.pipe(startWith('')),
        ohs.obsItems.pipe( map( L => L.filter( it => it.name !== "" && it.type.toLowerCase() !== "group") ) )
      ] ).pipe(
        map( ([value, options]) => this._filter(value, options))
      );
      this.allTypes = ohs.obsItems.pipe(
        map( L => L.reduce( (NL, it) => NL.indexOf(it.type) >= 0 ? NL : [...NL, it.type], [] as string[]) )
      )
    }
  
  ngOnInit(): void {   
  }
  
  async ok(): Promise<void> {
    const items: Item[] = await firstValueFrom(this.ohs.obsItems);
    const item = items.find( it => it.name === this.itemNameControl.value );
    switch(item?.type) {
      case "String":
      case "Color":
      case "Player":
      case "Switch":
      case "Dimmer":
      case "Rollershutter":
      case "Number":
      case "Number:Dimensionless":
      case "Number:Temperature":
        this.dialogRef.close( {
          label: item.label,
          id: item.name,
          type: item.type
        } );
        return;
    }
    throw "Unknown item or type";
  }

  cancel(): void {
    this.dialogRef.close();
  }

  private _filter(value: string, options: Item[]): Item[] {
    const filterValue = value.toLowerCase();
    return options.filter( option => (option.label ?? "").toLowerCase().includes(filterValue)
                                  || (option.name  ?? "").toLowerCase().includes(filterValue)
                         );
  }

}