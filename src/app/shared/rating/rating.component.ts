import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-rating',
    standalone: true,
    imports: [],
    templateUrl: './rating.component.html',
    styleUrl: './rating.component.scss'
})
export class RatingComponent implements OnInit {
@Input() score: number = 0;
@Input() color?: string = '#03dffc';
index: number = 0;
stars: string[] = [];

ngOnInit(): void {
  this.getStars(this.score);
}

  getStars(score:number){
    let percent = Math.round(score);
    let remainder = 0;
    let LimitOf100PercentRatings = 5;
    let evenDivisorLimit = 4;
    let ratingFullCapacityNumb = 100
    this.stars = [];
    let temp = percent/20;
    let evenDivisors = temp > LimitOf100PercentRatings ? LimitOf100PercentRatings : temp ;
    let moduloRemainder = (((percent % 20) / 20) *100).toString() +'%';
    let modulo = (((percent % 20) / 20) *100);
    
    if(modulo != 0){
      remainder = 5 - evenDivisors;
    }
    
    for(let s=0; s<evenDivisors; s++){
    this.index = s;
      if(s <= evenDivisorLimit){
        this.stars.push('100%');
      }else{
        return this.stars;
      }
    }
    
    
    if(this.index < evenDivisorLimit ){
      this.stars.push(moduloRemainder);
    }
    
    if(modulo < ratingFullCapacityNumb && this.stars.length < 5){
    let otherstars = LimitOf100PercentRatings - this.stars.length;
      for(let m=0; m<otherstars; m++){
      this.stars.push('0%')
      }
    }

    return this.stars;
    }
    
    getFill(i:string){
    return 'url(#F1g' + i + ')';
    }
}
