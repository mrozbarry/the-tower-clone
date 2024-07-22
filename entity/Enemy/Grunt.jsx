/**
 * @jsx createElement
 */
import { Enemy } from "../Enemy";

export class Grunt extends Enemy
{
  constructor(x, y) {
    super(x, y);
    this.setSpeed(60)
      .setSize(5)
      .setHits(1)
      .setMoneyValue(10)
      .setRgb({ r: 180, g: 180, b: 255 })
  }
}
