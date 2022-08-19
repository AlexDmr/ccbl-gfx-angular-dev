import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ProgVersionner, updateDisplay } from 'projects/ccbl-gfx9/src/public-api';
import { HumanReadableProgram } from 'ccbl-js/lib/ProgramObjectInterface';
import { ActionsPath } from '../../../projects/ccbl-gfx9/src/lib/smt.definitions';
import { BehaviorSubject, combineLatest, delay, distinctUntilChanged, firstValueFrom, map, Observable, of, share, startWith, switchMap } from 'rxjs';
import { SmtService } from 'projects/ccbl-gfx9/src/lib/smt.service';
import { OpenhabService } from './openhab.service';
import { Item } from './openHabItem';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { CcblProgService } from '../ccbl-prog.service';

interface CCBL_var<T> extends CONVERTER<T> {
  readonly label: string;
  readonly id: string;
  readonly type: string;
  readonly next: (v: T) => void;
  readonly obsCCBL: Observable<T>;
  readonly obsEnv: Observable<T>;
}

function getCCBL_var<T>({label, id, type, obsEnv, initialValue, update, conv}: {initialValue: T, label: string, id: string, type: string, obsEnv: Observable<T>, update: (v: T) => void, conv: CONVERTER<T>}): CCBL_var<T> {
  const bs = new BehaviorSubject<T>( initialValue );
  const ctrl = combineLatest([obsEnv, bs.pipe(
    distinctUntilChanged(),
    switchMap( ccbl => {
      return of(ccbl).pipe( delay(1000) )
    })
  ) ]);
  obsEnv.subscribe( env => console.log("ENV", label, "measured to", env) );
  bs.subscribe( ccbl => update(ccbl) );                       // Send update as soon as possible
  ctrl.subscribe( ([env, ccbl]) => {                          // Check after N ms wether env value is the same than ccbl one.
    if (env !== ccbl) {
      update(ccbl);
    }
  });
  return {
    label, id, type,
    ...conv,
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
  LAP = new BehaviorSubject<ActionsPath[]>([]);
  bsVar = new BehaviorSubject<CCBL_var<unknown>[]>( [] );

  constructor(private progServ: CcblProgService, private smtService: SmtService, private ohs: OpenhabService, private dialog: MatDialog) {
    const json = localStorage.getItem('TestEditorVerif');
    const P: HumanReadableProgram = json ? JSON.parse(json) : {};
    this.load(P);
    this.progServ.obsProgram.subscribe( nP => localStorage.setItem('TestEditorVerif', JSON.stringify(nP)) );
  }

  ngOnInit(): void {
  }

  get progV() {return this.progServ.progV}

  async load(prog?: HumanReadableProgram): Promise<void> {
    if (prog === undefined) {
      const dialog = this.dialog.open<DialogLoadProg, never, HumanReadableProgram | undefined>( DialogLoadProg );
      prog = await firstValueFrom( dialog.afterClosed() );
    }
    if (prog) {
      this.progServ.loadProgram( prog );
      // XXX Plug with existing environment channels, emitter, etc.
    }
  }

  async validate() {
    /*const conf = await this.smtService.evalProgram( this.progV.getCurrent() );
    this.LAP.next( conf.LAP );*/
  }

  get obsItems(): Observable<Item[]> {
    return this.ohs.obsItems;
  }

  initOpenHab(url: string) {
    this.ohs.initConnection(url);
  }

  async appendVar(res?:  Omit<CCBL_var<any>, "obsCCBL" | "obsEnv" | "next" | "get" | "set">) {
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
              conv: converterDimmer,
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

  constructor( private ohs: OpenhabService, public dialogRef: MatDialogRef<DialogAppendVar, Omit<CCBL_var<any>, "obsCCBL" | "obsEnv" | "next" | "get" | "set">>,
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





/**
 * Composant interne pour dialogue chargement de programme
 */
 @Component({
  selector: 'dialog-load-prog',
  template: `
    <mat-toolbar color="primary">
      Load a CCBL program
    </mat-toolbar>
    <form>
      <mat-form-field>
        <mat-label>Program (JSON format)</mat-label>
        <textarea [formControl]="progControl" matInput placeholder="Program (JSON format)"></textarea>
      </mat-form-field>
    </form>
    <hr/>
    <button mat-raised-button color="warn" (click)="cancel()">Cancel</button>
    &nbsp;
    <button mat-raised-button color="primary" (click)="ok()">Append</button>
  `,
  styles: [`
    form {
      display: flex;
      flex-flow: column;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DialogLoadProg implements OnInit {
  progControl = new FormControl('', {nonNullable: true});

  constructor( public dialogRef: MatDialogRef<DialogLoadProg, HumanReadableProgram>) {
  }
  
  ngOnInit(): void {
    this.progControl.setValue( JSON.stringify(pgTest) );
  }
  
  async ok(): Promise<void> {
    this.dialogRef.close( JSON.parse(this.progControl.value) )
  }

  cancel(): void {
    this.dialogRef.close();
  }

}


const pgTest: HumanReadableProgram = {
  name: "LivingRoom lights",
  description: "Just a test program for Domus",
  dependencies: {
    import: {
      channels: [
        {name: "dLivingroomLight1", type: "Dimmer [0-100]"},
        {name: "dLivingroomLight2", type: "Dimmer [0-100]"},
      ],
      emitters: [
        // Voir un capteur de porte ou autre ?
      ]
    }
  },
  actions: [
    {channel: "dLivingroomLight1", affectation: {value: "0"} },
    {channel: "dLivingroomLight2", affectation: {value: "0"} },
  ]
}