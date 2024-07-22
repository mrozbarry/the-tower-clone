/**
 * @jsx createElement
 */
import { Enemy } from "../Enemy";

export class Thug extends Enemy
{
  constructor(x, y) {
    super(x, y);

    this.setSpeed(40)
      .setSize(10)
      .setHits(3)
      .setMoneyValue(20)
      .setRgb({ r: 255, g: 255, b: 180 })
  }
}
