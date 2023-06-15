import {Component, OnInit, ChangeDetectionStrategy, Input} from '@angular/core';
import { People } from '../data/Scene';
import { SceneService } from '../scene.service';

@Component({
  selector: 'app-people',
  templateUrl: './people.component.html',
  styleUrls: ['./people.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PeopleComponent implements OnInit {
  @Input() data?: People<any>;
  @Input() height = 100;
  // @Output() update = new EventEmitter<People<any>>();
  imgPhoning = '/assets/phoning.png';

  constructor(private sim: SceneService) { }

  ngOnInit(): void {
  }

  togglePhoning() {
    if (this.data) {
      this.sim.updatePeople(this.data.name, {
        ...this.data,
        phoning: !this.data.phoning
      });
      // this.update.emit({...this.data} );
    }
  }
}

