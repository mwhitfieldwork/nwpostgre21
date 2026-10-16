import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-card-basic',
    standalone: true,
    imports: [],
    templateUrl: './card-basic.component.html',
    styleUrl: './card-basic.component.scss'
})
export class CardBasicComponent implements OnInit{

  ngOnInit(): void {
    // console.log('cards work');
  }

}
