import { writable } from "svelte/store";
import debounce from 'lodash/debounce';

const isWindow = typeof localStorage !== 'undefined';

export const wheelValue = writable(1);
export const canvasOffsetX = writable(0);
export const canvasOffsetY = writable(0);
export const canvasNodes = writable<any[]>([]);

if (isWindow && localStorage.canvasWheelValue) {
  wheelValue.set(JSON.parse(localStorage.canvasWheelValue));
}
wheelValue.subscribe(
  (val) => isWindow ? localStorage.canvasWheelValue = JSON.stringify(val) : null,
);

if (isWindow && localStorage.canvasOffsetX) {
  canvasOffsetX.set(JSON.parse(localStorage.canvasOffsetX));
}
canvasOffsetX.subscribe(
  (val) => isWindow ? localStorage.canvasOffsetX = JSON.stringify(val) : null,
);

if (isWindow && localStorage.canvasOffsetY) {
  canvasOffsetY.set(JSON.parse(localStorage.canvasOffsetY));
}
canvasOffsetY.subscribe(
  (val) => isWindow ? localStorage.canvasOffsetY = JSON.stringify(val) : null,
);

if (isWindow && localStorage.canvasNodes) {
  canvasNodes.set(JSON.parse(localStorage.canvasNodes));
}
const saveNodes = debounce((nodes) => {
  if (isWindow) {
    localStorage.canvasNodes = JSON.stringify(nodes);
  }
}, 250);
canvasNodes.subscribe((nodes) => saveNodes(nodes));

export class InfiniteCanvas {
  mainEl: HTMLDivElement;
  controller: AbortController;

  constructor(el: HTMLDivElement) {
    this.mainEl = el;
    this.controller = new AbortController();
    this.setup();
  }

  setup() {
    window.addEventListener('mousedown', (e) => this.dragCanvas(e), { signal: this.controller.signal });
    window.addEventListener('paste', (e: any) => this.onPaste(e), { signal: this.controller.signal });
    window.addEventListener('wheel', (e) => {
      wheelValue.update((val) => {
        val += (e.deltaY / 1000);
        val = Math.max(0.1, val);
        return val;
      });
    }, { signal: this.controller.signal });
  }

  reset() {
    if (this.controller) {
      this.controller.abort();
    }
  }

  removeNode(id: number) {
    canvasNodes.update(val => val.filter(item => item.id !== id));
  }

  addFileNode(item: DataTransferItem) {
    const blob = item.getAsFile();
    if (blob) {
      const reader = new FileReader();
      reader.onload = async (event: any) => {
        const dataURL = event.target.result;
        canvasNodes.update((val) => {
          return [...val, {
            id: val.length,
            type: 'image',
            data: dataURL,
            x: 100, y: 300,
          }];
        })
      };
      reader.readAsDataURL(blob);
    }
  }

  addTextNode(item: DataTransferItem) {
    item.getAsString((str: string) => {
      canvasNodes.update((val) => {
        val = val.filter((item) => item.data !== str);
        return [...val, {
          id: val.length,
          type: 'text',
          data: str,
          x: 100, y: 300,
        }];
      })
    });
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    if (event.clipboardData) {
      const items = event.clipboardData.items;
      Array.from(items).forEach((item) => {
        console.log(item.kind, item);
        if (item.kind === 'file') {
          this.addFileNode(item);
        } else if (item.kind === 'string') {
          this.addTextNode(item);
        }
      });
    }
  };

  dragCanvas(e: MouseEvent) {
    e.preventDefault();
    const { clientX, clientY } = e;
    let x = 0;
    let y = 0;
    let wheel = 0;
    canvasOffsetX.subscribe(val => x = val)();
    canvasOffsetY.subscribe(val => y = val)();
    wheelValue.subscribe(val => wheel = val)();

    const mousemove = (eMove: MouseEvent) => {
      eMove.preventDefault();
      const { clientX: moveX, clientY: moveY } = eMove;
      canvasOffsetX.update(() => {
        const newX = x - ((clientX - moveX) * (1 / wheel));
        return newX;
      });
      canvasOffsetY.update(() => {
        const newY = y - ((clientY - moveY) * (1 / wheel));
        return newY;
      });
    };

    const mouseup = () => {
      window.removeEventListener('mousemove', mousemove);
      window.removeEventListener('mouseup', mouseup);
    };

    window.addEventListener('mousemove', mousemove);
    window.addEventListener('mouseup', mouseup);
  }

  drag(e: MouseEvent, node: any) {
    e.preventDefault();
    e.stopPropagation();
    const el = e.currentTarget as HTMLElement;
    const { clientX, clientY } = e;
    const { x, y } = node;
    let nodeX = x;
    let nodeY = y;
    let wheel = 0;
    wheelValue.subscribe(val => wheel = val)();

    const mousemove = (eMove: MouseEvent) => {
      eMove.preventDefault();
      eMove.stopPropagation();
      const { clientX: moveX, clientY: moveY } = eMove;
      nodeX = x - ((clientX - moveX) * (1 / wheel));
      nodeY = y - ((clientY - moveY) * (1 / wheel));
      el.style.cssText = `
        transform: translate3d(${nodeX}px, ${nodeY}px, 0)
      `;
    };

    const mouseup = () => {
      el.style.cssText = '';
      canvasNodes.update(
        (val) => val.map((n) => n.id === node.id ? { ...n, x: nodeX, y: nodeY } : n),
      );
      window.removeEventListener('mousemove', mousemove);
      window.removeEventListener('mouseup', mouseup);
    };

    window.addEventListener('mousemove', mousemove);
    window.addEventListener('mouseup', mouseup);
  }

  async b64toBlob(base64: string, type = 'application/octet-stream'): Promise<Blob> {
    const res = await fetch(`data:${type};base64,${base64}`);
    return await res.blob()
  }
}