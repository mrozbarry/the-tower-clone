/**
 * @jsx createElement
 */
import { createElement, Stateful, Path, Rect, Properties, MoveTo, LineTo, FillRect, Text } from 'declarativas';
// import {createElement, FillRect, Group, Properties, StrokeRect} from "declarativas/src/lib/index.js";

export const Meter = ({ x, y, value, max, width, label, barColor = 'red', borderColor = 'white' }) => {
  const percent = Math.min(value, max) / max;
  const height = 14;

  return (
    <Stateful>
      <Properties fillStyle={barColor} strokeStyle={borderColor} />
      <Path stroke>
        <MoveTo x={x} y={y} />
        <LineTo x={x} y={y+height}/>
        <LineTo x={x+width} y={y+height}/>
        <LineTo x={x+width} y={y+height-2}/>
      </Path>
      <FillRect x={x+2} y={y} w={(width - 4) * percent} h={height - 4} />
      <Properties fillStyle="white" font="14px sans-serif"/>
      <Text x={x+width + 4} y={y + (height / 2) + 4} text={label} />
    </Stateful>
  );
};
