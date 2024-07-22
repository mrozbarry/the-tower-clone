export class Trait
{
  constructor() {
    this.entity = null;
  }

  attach(entity) {
    this.entity = entity;
  }

  detach() {
    this.entity = null;
  }
}
