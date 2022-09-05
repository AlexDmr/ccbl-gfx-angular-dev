import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(private US: UserService) { }

  ngOnInit(): void {
  }

  loginGoogle() {
    this.US.loginGoogle();
  }

}
