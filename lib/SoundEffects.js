export class SoundEffects {
  constructor() {
    this.audio = {};
    this.muted = true;
  }

  queue(name, url) {
    this.audio[name] = {
      element: null,
      url,
    };
    return this;
  }

  load() {
    return Promise.all(Object.keys(this.audio).map((key) => {
      const audio = this.audio[key];
      if (audio.element) {
        return Promise.resolve(audio);
      }

      return new Promise((resolve, reject) => {
        const element = new Audio(audio.url);
        element.addEventListener('canplaythrough', () => {
          audio.element = element;
          resolve(audio);
        }, { once: true });
        element.addEventListener('error', () => {
          reject(audio);
        }, { once: true });
      });

    })).then(() => this);
  }

  play(name) {
    if (this.muted || !name || !(name in this.audio)) {
      return this;
    }

    this.audio[name].element.play();

    return this;
  }

  playOneOf(...names) {
    const keys = names.filter(k => (k in this.audio) && this.audio[k].element);
    const index = Math.floor(Math.random() * keys.length);
    return this.play(keys[index]);
  }
}
