export const toRad = (angle) => angle * Math.PI / 180;
export const toDeg = (radians) => radians / Math.PI * 180;

export const jitter = (value, plusOrMinus) => (
  value + (Math.random() * (plusOrMinus * 2)) - plusOrMinus
);

export const vecZero = { x: 0, y: 0 };

export const distance = (a, b = vecZero) => (
  Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2))
);

