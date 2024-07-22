/**
 * @jsx createElement
 */
import { Enemy } from "../Enemy";

export class Heavy extends Enemy
{
  constructor(x, y) {
    super(x, y, 5, 20, 15, 40, { r: 255, g: 180, b: 255 });
  }
}
