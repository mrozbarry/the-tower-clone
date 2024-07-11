/**
 * @jsx createElement
 */
import { createElement, Path, Arc } from 'declarativas';

const TwoPi = Math.PI * 2;

export const StrokeCircle = (props) => (
<Path stroke isClosed>
    <Arc x={props.x || 0} y={props.y || 0} radius={props.radius} startAngle={0} endAngle={TwoPi}/>
</Path>
);
