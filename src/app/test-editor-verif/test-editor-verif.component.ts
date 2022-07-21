import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ProgVersionner } from 'projects/ccbl-gfx9/src/public-api';
import { HumanReadableProgram } from 'ccbl-js/lib/ProgramObjectInterface';
import { ActionsPath } from '../../../projects/ccbl-gfx9/src/lib/smt.definitions';
import { BehaviorSubject, combineLatest, tap, distinctUntilChanged, filter, firstValueFrom, map, Observable, share, startWith } from 'rxjs';
import { SmtService } from 'projects/ccbl-gfx9/src/lib/smt.service';
import { OpenhabService } from './openhab.service';
import { Item } from './openHabItem';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';

interface CCBL_var<T> {
  label: string;
  id: string;
  type: string;
  value: {
    init: T;
    get: (v: T) => string;
    set: (s: string) => T;
  };
  bs: BehaviorSubject<T>;
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

  async appendVar() {
    const dialog = this.dialog.open<DialogAppendVar, never, CCBL_var<unknown> | undefined>( DialogAppendVar );
    const res = await firstValueFrom( dialog.afterClosed() );
    console.log( res );
    if (res) {
      // Get ref from openHab item
      const openHabItemObs = this.ohs.obsItems.pipe(
        map( L => L.find( d => res.id === d.name ) ),
        filter( it => !!it ),
        map( it => res.value.set( it!.state ) ),
        // tap( v => console.log("up", v) ),
        distinctUntilChanged(),
        share()
      );

      openHabItemObs.subscribe( v => console.log(`Item value is now ${v}`) )
      
      // Update the local value ?
      this.ohs.setItem(res.id, res.value.get(res.value.init) );
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
      <mat-form-field>
        <mat-label>Type</mat-label>
        <mat-select [formControl]="typeControl">
          <mat-option value="boolean">Boolean</mat-option>
          <mat-option value="number" >Number </mat-option>
          <mat-option value="string" >String </mat-option>
        </mat-select>
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

  constructor( private ohs: OpenhabService, public dialogRef: MatDialogRef<DialogAppendVar, CCBL_var<any>>,
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
    let ccblVar: undefined | CCBL_var<unknown>;
    switch(item?.type) {
      case "String":
      case "Color":
      case "Player":
        break;
      case "Switch":
        const ccblSwitch: CCBL_var<boolean> = {
          label: item.label,
          id: item.name,
          type: item.type,
          value: {
            init: true,
            ...converterSwitch
          },
          bs: new BehaviorSubject(true)
        }
        this.dialogRef.close( ccblSwitch );
        return;
      case "Dimmer": 
        const ccblDimmer: CCBL_var<number> = {
          label: item.label,
          id: item.name,
          type: item.type,
          value: {
            init: 100,
            ...converterDimmer
          },
          bs: new BehaviorSubject(100)
        }
        this.dialogRef.close( ccblDimmer );
        return;
      case "Rollershutter":
      case "Number":
      case "Number:Dimensionless":
      case "Number:Temperature":
        break;
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