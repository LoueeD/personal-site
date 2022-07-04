import { writable } from "svelte/store";

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
const saveNodes = (nodes: any) => {
  if (isWindow) {
    localStorage.canvasNodes = JSON.stringify(nodes);
  }
};
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
    window.addEventListener('dblclick', () => {
      this.addTextNode('Enter text here ...');
    });
  }

  reset() {
    if (this.controller) {
      this.controller.abort();
    }
  }

  removeNode(id: string | number) {
    console.log('Remove Node: ', id);
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
            id: this.uid(),
            type: 'image',
            data: dataURL,
            x: 100, y: 300,
          }];
        })
      };
      reader.readAsDataURL(blob);
    }
  }

  addTextNode(str: string) {
    canvasNodes.update((val) => {
      val = val.filter((item) => item.data !== str);
      return [...val, {
        id: this.uid(),
        type: 'text',
        data: str,
        x: 100, y: 300,
      }];
    });
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    if (event.clipboardData) {
      const items = Array.from(event.clipboardData.items);
      const getFile = () => items.find((item) => item.kind === 'file');
      const getItem = (t: string) => items.find((item) => item.kind === 'string' && item.type === t);
      const fileItem = getFile();
      const strItem = getItem('text/html') || getItem('text/plain');
      if (fileItem) {
        this.addFileNode(fileItem);
      } else if (strItem) {
        strItem.getAsString((str: string) => {
          this.addTextNode(str);
        });
      }
      items.forEach((item) => {
        console.log(item.kind, item.type);
      });
    }
  };

  dragCanvas(e: MouseEvent) {
    // e.preventDefault();
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
    if (e.target && InfiniteCanvas.preventDefault(e.target as HTMLElement)) {
      e.preventDefault();
    }
    e.stopPropagation();
    const el = e.currentTarget as HTMLElement;
    const { width, height } = el.getBoundingClientRect();
    const { clientX, clientY } = e;
    const { x, y } = node;
    let nodeX = x;
    let nodeY = y;
    let wheel = 0;
    wheelValue.subscribe(val => wheel = val)();
    const resize = (e.target as HTMLElement).getAttribute('resize-node') !== null;
    let w = 0;
    let h = 0;
    let mouseMoved = false;

    const mousemove = (eMove: MouseEvent) => {
      mouseMoved = true;
      eMove.preventDefault();
      eMove.stopPropagation();
      const { clientX: moveX, clientY: moveY } = eMove;
      const deltaX = ((clientX - moveX) * (1 / wheel));
      const deltaY = ((clientY - moveY) * (1 / wheel));
      if (!resize) {
        nodeX = x - deltaX;
        nodeY = y - deltaY;
        el.style.cssText = `
          transform: translate3d(${nodeX}px, ${nodeY}px, 0);
          width: ${width * (1 / wheel)}px;
          height: ${height * (1 / wheel)}px;
        `;
      } else {
        w = (width * (1 / wheel)) - deltaX;
        h = (height * (1 / wheel)) - deltaY;
        el.style.cssText = `transform: translate3d(${nodeX}px, ${nodeY}px, 0);width: ${w}px; height: ${h}px;`;
      }
    };

    const mouseup = () => {
      if (mouseMoved) {
        el.style.cssText = '';
        const payload: Record<string, number> = { x: nodeX, y: nodeY };
        if (w && h) {
          payload.width = w;
          payload.height = h;
        }
        canvasNodes.update(
          (val) => val.map((n) => n.id === node.id ? { ...n, ...payload } : n),
        );
      }
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

  static preventDefault(el: HTMLElement): boolean {
    const prevent = el.getAttribute('dont-prevent-default');
    if (prevent === null && el.parentElement) {
      return InfiniteCanvas.preventDefault(el.parentElement);
    }
    if (!el.parentElement) {
      return true;
    }
    return false;
  }

  uid = () => String(Date.now().toString(32) + Math.random().toString(16)).replace(/\./g, '')
}