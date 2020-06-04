import {Component, ElementRef, Input, OnInit, ViewChild, AfterViewInit} from '@angular/core';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-clock-display',
  templateUrl: './clock-display.component.html',
  styleUrls: ['./clock-display.component.scss']
})
export class ClockDisplayComponent implements OnInit, AfterViewInit {
  @ViewChild('hrHand',{static:false}) hrHand: ElementRef;
  @ViewChild('minHand',{static:false}) minHand: ElementRef;
  @ViewChild('secHand',{static:false}) secHand: ElementRef;
  @Input() public tdate: Observable<Date>;

  constructor() {}

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.tdate.subscribe( d => this.updateClock(d) );
  }

  updateClock(date) {
    // console.log('update with', date);
    this.secHand.nativeElement.style.transform = 'rotate('+date.getSeconds()*6+'deg)';
    this.minHand.nativeElement.style.transform = 'rotate('+date.getMinutes()*6+'deg)';
    this.hrHand.nativeElement.style.transform ='rotate('+(date.getHours()*30 + date.getMinutes()*0.5)+'deg)';
  }

}
