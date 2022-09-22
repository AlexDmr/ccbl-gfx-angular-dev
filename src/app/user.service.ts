import { Injectable } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, User, signOut } from '@angular/fire/auth';
import { NavigationEnd, Router } from '@angular/router';
import { ProxyCcblProg } from 'projects/ccbl-gfx9/src/lib/ProxyCcblProg';
import { filter, map, Observable, shareReplay, Subject } from 'rxjs';
import { combineLatest } from 'rxjs/internal/observable/combineLatest';


const admins: string[] = ["alxdmr2@gmail.com"];
const experimentateurs: string[] = ["alxdmr2@gmail.com"];

export type ROLE = "ADMIN" | "EXPERIMENTATEUR";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private f_IsAdmin = (u: User | null) => !!u?.email ? admins.indexOf(u.email) >= 0 : false
  private f_IsExperimentateur = (u: User | null) => !!u?.email ? experimentateurs.indexOf(u.email) >= 0 : false
  private bsUser = new Subject<User | null>( );
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

  constructor(private afa: Auth, private router: Router, private proxyCcbl: ProxyCcblProg) {
    const obsUrl = this.router.events.pipe(
      filter( e => e instanceof NavigationEnd ),
      map(e => (e as NavigationEnd).url ),
      // startWith("/")
    )
    afa.onAuthStateChanged(this.bsUser);
    combineLatest([this.obsRoles, obsUrl]).subscribe( ([L, url]) => {
      // console.log("Rôles:", L, "and url", url);
      if (  url.indexOf("/demo") === -1) {
        if (L.indexOf("ADMIN") >= 0) {
          if (url.indexOf("/experimentateur") === -1) {
            this.router.navigate(["admin"])
          }
        } else {
          if (L.indexOf("EXPERIMENTATEUR") >= 0) {
            this.router.navigate(["experimentateur"])
          } else {
            this.router.navigate(["login"])
          }
        }
      }
    });

    // Plug to websocket
    this.bsUser.subscribe( async U => {
      console.log("User", U?.displayName);
      if (U) {
        const jwt: string = await U.getIdToken();
        this.proxyCcbl.connect("ws://localhost:3001", {jwt});
      } else {
        this.proxyCcbl.disconnect(1001);
      }
      
    });
    
  }

  loginGoogle() {
    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    provider.setCustomParameters({prompt: 'select_account'})
    signInWithPopup(this.afa, provider);
  }

  signOut() {
    signOut(this.afa);
  }

}
