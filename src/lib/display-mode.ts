export class DisplayMode {
  static readonly Particles = 'Particles';

  static readonly Lines = 'Lines';

  static readonly InfiniteCanvas = 'Infinite Canvas';

  static get Modes() {
    return [this.Particles, this.Lines, this.InfiniteCanvas];
  }
}