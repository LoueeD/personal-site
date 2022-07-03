class CanvasHelper {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  animate: number | undefined;
  mousePosition = { x: 0, y: 0 };
  isMouseDown = false;
  ticker = 0;
  canvasRotate = Math.PI / 10;
  trace: { x: number, y: number }[] = [];
  controller: AbortController;
  nodes: {
    speed: number;
    size: number;
    ordinal: number;
    rotation: number;
    x: number;
    y: number;
  }[] = [];
  volumeMeterValue = 0;
  wheelValue = 1;
  clickedTimer = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    this.controller = new AbortController();
    this.setup();
  }

  setup() {
    const dpr = window.devicePixelRatio || 1;
    const rect = document.body.getBoundingClientRect();
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    this.nodes = [...new Array(4000)].map((_, i) => this.addNode(i));
    this.draw();
    window.addEventListener('mousemove', (e) => this.move(e), { signal: this.controller.signal });
    window.addEventListener('touchmove', (e) => this.move(e), { signal: this.controller.signal });
    window.addEventListener('click', (e) => this.clicked(), { signal: this.controller.signal });
    window.addEventListener('wheel', (e) => {
      this.wheelValue += (e.deltaY / 1000);
    }, { signal: this.controller.signal });
    if (document.location.hash.includes('audio')) {
      this.setupAudio();
    }
  }

  reset() {
    if (this.animate) {
      cancelAnimationFrame(this.animate);
    }
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.controller.abort();
  }

  move(e: MouseEvent | TouchEvent) {
    const mouseEvent = e as MouseEvent;
    const touchEvent = e as TouchEvent;
    if (mouseEvent.clientX && mouseEvent.clientY) {
      const { clientX: x, clientY: y } = mouseEvent;
      this.mousePosition = { x, y };
      this.trace.push({ ...this.mousePosition });
      this.isMouseDown = mouseEvent.buttons !== 0;
    } else if (touchEvent.touches) {
      e.preventDefault();
      const { clientX: x, clientY: y } = touchEvent.touches[0];
      this.mousePosition = { x, y };
      this.trace.push({ ...this.mousePosition });
    }
  };

  clicked() {
    this.clickedTimer = 1;

    const easeOut = () => {
      if (this.clickedTimer > 1) {
        this.clickedTimer -= this.clickedTimer / 12;
        requestAnimationFrame(() => easeOut());
      } else {
        this.clickedTimer = 0;
      }
    }

    const easeIn = () => {
      if (this.clickedTimer < 1000) {
        this.clickedTimer += this.clickedTimer / 12;
        requestAnimationFrame(() => easeIn());
      } else {
        easeOut();
      }
    }
    easeIn();
  }

  draw() {
    const { x, y } = this.mousePosition;
    if (this.ctx && this.ticker < 1) {
      this.ticker += 0.025;
      this.ctx.globalAlpha = this.ticker;
    }
    this.ctx.resetTransform();
    this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    this.nodes.forEach((node, i) => {
      if (this.ctx) {

        this.ctx.beginPath();
        const CLICK_SIZE = (Math.random() * this.clickedTimer / 200) * (i / 1000);
        const size = node.size + CLICK_SIZE + Math.max(0.1, Math.floor(Math.random() * this.wheelValue));
        this.ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
        node.ordinal += 0.25 + (5 * this.volumeMeterValue);
        this.ctx.fillStyle = this.makeColor(node.ordinal, 20);
        const speed = node.speed * ((Math.round(this.volumeMeterValue * 50)) + 1);
        this.ctx.fill();
        const rand = 1;
        if (node.x > x) node.x -= ((node.x / node.rotation) * speed) * rand;
        if (node.x < x) node.x += ((node.x / node.rotation) * speed) * rand;
        if (node.y > y) node.y -= ((node.y / node.rotation) * speed) * rand;
        if (node.y < y) node.y += ((node.y / node.rotation) * speed) * rand;
        if (!this.isMouseDown) {
          this.canvasRotate += 0.0000000001;
        }
        const ty = (window.innerHeight / 2);
        this.ctx.translate(window.innerWidth / 2, ty);
        this.ctx.rotate(this.canvasRotate);
        this.ctx.translate(-window.innerWidth / 2, -ty);
      }
    });
    this.animate = requestAnimationFrame(() => this.draw());
  };

  addNode(i: number) {
    const halfW = window.innerWidth / 2;
    const halfH = window.innerHeight / 2;
    const speed = 1.5;
    const size = Math.max(0.5, speed * 0.1);
    return {
      speed,
      size,
      ordinal: i,
      rotation: Math.floor(Math.random() * 1000) + 50,
      x: Math.floor(Math.random() * halfW) + halfW,
      y: Math.floor(Math.random() * halfH) + halfH
    };
  };

  makeColor(colorNum: number, colors: number) {
    if (colors < 1) colors = 1;
    const val = (colorNum * (360 / colors)) % 360;
    return 'hsl( ' + val + ', 100%, 60% )';
  }

  async setupAudio() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    const audioContext = new AudioContext();
    const mediaStreamAudioSourceNode = audioContext.createMediaStreamSource(stream);
    const analyserNode = audioContext.createAnalyser();
    mediaStreamAudioSourceNode.connect(analyserNode);

    const pcmData = new Float32Array(analyserNode.fftSize);
    const onFrame = () => {
      analyserNode.getFloatTimeDomainData(pcmData);
      let sumSquares = 0.0;
      for (const amplitude of pcmData) { sumSquares += amplitude * amplitude; }
      this.volumeMeterValue = Math.sqrt(sumSquares / pcmData.length);
      window.requestAnimationFrame(onFrame);
    };
    window.requestAnimationFrame(onFrame);
  }
}

function particles(node: HTMLCanvasElement) {
  const canvasHelper = new CanvasHelper(node);

  return {
    destroy() {
      canvasHelper.reset();
    }
  };
}

export default particles;

