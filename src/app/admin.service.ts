import { Injectable } from '@angular/core';
import { User } from '@angular/fire/auth';
import { HumanReadableProgram } from 'ccbl-js/lib/ProgramObjectInterface';
import { BehaviorSubject } from 'rxjs';
import { UserService } from './user.service';

export interface EXPERIMENTATEUR {
  user: {email: string; name: string};
  programs: {
    [k in string]: {
      comments: string;
      prog: HumanReadableProgram;
    }
  }
}

export interface DataAdmin {
  user: User;
  experimentateurs: EXPERIMENTATEUR[];
  root: HumanReadableProgram;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private bsDataAdmin = new BehaviorSubject<DataAdmin | undefined>( undefined );

  constructor(private us: UserService) { }


}
