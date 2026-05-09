export const introTiming = {
  desktop: 3.35,
  mobile: 2.05
};

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function isCoarsePointer() {
  return typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
}

export class SpringValue {
  private value: number;
  private velocity = 0;
  private readonly stiffness: number;
  private readonly damping: number;

  constructor(initialValue = 0, stiffness = 0.12, damping = 0.82) {
    this.value = initialValue;
    this.stiffness = stiffness;
    this.damping = damping;
  }

  step(target: number) {
    const force = (target - this.value) * this.stiffness;
    this.velocity = (this.velocity + force) * this.damping;
    this.value += this.velocity;
    return this.value;
  }

  get() {
    return this.value;
  }

  set(nextValue: number) {
    this.value = nextValue;
    this.velocity = 0;
  }
}
