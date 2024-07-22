/**
 * @jsx createElement
 */
import { createElement, Group, Properties, Text } from 'declarativas';

export const Money = ({ x, y, money }) => {
  return (
    <Group>
      <Properties fillStyle="white" font="18px sans-serif" textAlign="center"/>
      <Text x={x} y={y} text={`$ ${money}`} />
    </Group>
  );
};
