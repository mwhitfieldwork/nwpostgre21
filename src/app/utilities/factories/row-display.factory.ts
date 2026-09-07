// row-display.factory.ts
import { Injectable } from '@angular/core';

export interface DisplayRow {
  pkID: number;
  status: string;
  rating: number;
}

@Injectable({ providedIn: 'root' })
export class RowDisplayFactory {

  create<T extends object>(item: T, index: number, statuses: string[]): T & DisplayRow {
    return {
      ...item,
      pkID: index + 1,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      rating: Math.floor(Math.random() * 81) + 20
    };
  }

  createMany<T extends object>(items: T[], statuses: string[]): (T & DisplayRow)[] {
    return items.map((item, index) => this.create(item, index, statuses));
  }
}