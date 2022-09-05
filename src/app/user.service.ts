import { Injectable } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, User } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { BehaviorSubject, map, Observable, shareReplay } from 'rxjs';


const admins: string[] = ["alxdmr2@gmail.com"];
const experimentateurs: string[] = ["alxdmr2@gmail.com"];

export type ROLE = "ADMIN" | "EXPERIMENTATEUR";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private f_IsAdmin = (u: User | null) => !!u?.email ? admins.indexOf(u.email) >= 0 : false
  private f_IsExperimentateur = (u: User | null) => !!u?.email ? experimentateurs.indexOf(u.email) >= 0 : false
  private bsUser = new BehaviorSubject<User | null>( null );
  readonly obsUser = this.bsUser.asObservable();
  readonly obsIsAdmin: Observable<boolean> = this.obsUser.pipe(
    map( this.f_IsAdmin ),
    shareReplay(1)
  )
  readonly obsIsExperimentateur: Observable<boolean> = this.obsUser.pipe(
    map( this.f_IsExperimentateur ),
    shareReplay(1)
  )
  readonly obsRoles: Observable<ROLE[]> = this.obsUser.pipe(
    map( u => {
      const L: ROLE[] = [];
      if (this.f_IsExperimentateur(u)) {L.push("EXPERIMENTATEUR")}
      if (this.f_IsAdmin(u)) {L.push("ADMIN")}
      return L;
    } ),
    shareReplay(1)
  )

  constructor(private afa: Auth, private router: Router) {
    afa.onAuthStateChanged(this.bsUser);
    this.obsRoles.subscribe( L => {
      console.log(L);
        if (L.indexOf("ADMIN") >= 0) {
          this.router.navigate(["admin"])
        } else {
          if (L.indexOf("EXPERIMENTATEUR") >= 0) {
            this.router.navigate(["experimentateur"])
          } else {
            this.router.navigate(["login"])
          }
        }
        return true;
      }
    );
  }

  loginGoogle() {
    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    signInWithPopup(this.afa, provider);
  }

}
