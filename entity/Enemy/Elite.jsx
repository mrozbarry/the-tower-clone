/**
 * @jsx createElement
 */
import { Enemy } from "../Enemy";

export class Elite extends Enemy
{
  constructor(x, y) {
    super(x, y, 30, 15, 8, 30, { r: 255, g: 180, b: 180 });
  }
}
