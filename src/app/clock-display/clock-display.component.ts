import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Component({
  selector: 'app-clock-display',
  templateUrl: './clock-display.component.html',
  styleUrls: ['./clock-display.component.scss']
})
export class ClockDisplayComponent implements OnInit {
  @ViewChild('hrHand',{static:false}) hrHand: ElementRef;
  @ViewChild('minHand',{static:false}) minHand: ElementRef;
  @ViewChild('secHand',{static:false}) secHand: ElementRef;
  @Input() public tdate: BehaviorSubject<Date>;
  constructor() { }

  ngOnInit(): void {
    setInterval(()=>{
      this.tdate.subscribe(()=>this.updateClock(this.tdate.getValue()));
    },1000);
  }
  updateClock(date){
    this.secHand.nativeElement.style.transform = 'rotate('+date.getSeconds()*6+'deg)';
    this.minHand.nativeElement.style.transform = 'rotate('+date.getMinutes()*6+'deg)';
    this.hrHand.nativeElement.style.transform ='rotate('+(date.getHours()*30 + date.getMinutes()*0.5)+'deg)';
  }

}
