import './App.scss';
import React from 'react';
import { Ribbon } from './Ribbon';
import { BoundingBox, MousePosition, MusicalNote, Note, NotePitch, NoteValue } from './common';

function isNote(note: MusicalNote): note is Note {
  return "pitch" in note;
}

const BAR_COUNT: number = 5;
const BAR_SPACING: number = 10;

class RenderableNote {
  private _boundingBox?: BoundingBox;

  constructor(private readonly note: MusicalNote) {}

  public get value(): NoteValue {
    return this.note.value;
  }

  public set value(v: NoteValue) {
    this.note.value = v;
  }

  public set pitch(p: NotePitch | null) {
    if (!isNote(this.note) || !p) {
      return;
    }

    this.note.pitch = p;
  }

  public get pitch(): NotePitch | null {
    if (!isNote(this.note)) {
      return null;
    }

    return this.note.pitch;
  }

  heightFromPitch() {
    if (!isNote(this.note)) {
      return 0;
    }

    switch (this.note.pitch) {
      case NotePitch.A:
        return -15;
      case NotePitch.B:
        return -20;
      case NotePitch.C:
        return -25;
      case NotePitch.D:
        return -30;
      case NotePitch.E:
        return 0;
      case NotePitch.F:
        return -5;
      case NotePitch.G:
        return -10;
    }
  }

  drawNote(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    mousePosition: MousePosition,
    isActive: boolean,
    canBeHovered: boolean,
  ) {
    const mouseInBox = canBeHovered && isMouseInBox(mousePosition, this.bbox);
    if (isActive) {
      context.strokeStyle = "#2c528c"
      context.fillStyle = "#2c528c";
    } else if (mouseInBox) {
      context.strokeStyle = "#ff0000"
      context.fillStyle = "#ff0000";
    } else {
      context.strokeStyle = "#000000";
      context.fillStyle = "#000000";
    }

    if (!isNote(this.note)) {
      throw new Error();
    }

    switch (this.note.value) {
      case NoteValue.Half:
        this.drawHalfNote(context, x, y);
        break;
      case NoteValue.Whole:
        this.drawWholeNote(context, x, y);
        break;
      case NoteValue.Quarter:
      default:
        this.drawQuarterNote(context, x, y);
        break;
    }

    context.setTransform(1, 0, 0, 1, 0, 0);
    context.strokeStyle = "#ff0000"
    // context.strokeRect(x + 6, y + 12, 15, 43);
    // context.strokeRect(x - 2, y + 43, 25, 14);

    return mouseInBox ? this : null;
  }

  // [   -1   0 0]
  // [    0  -1 0]
  // [253.5 262 1]

  private drawHalfNote(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
  ) {
    const { ball, stem } = halfNote();
    context.transform(-1, 0, 0, -1, 247.5, 272);
    context.translate(-x, -y);
    // context.strokeRect(x, y, 14.566, 41.17);
    context.stroke(stem);
    context.fill(ball, "evenodd");
  }

  private drawWholeNote(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
  ) {
    const ball = wholeNote();
    context.translate(0, 7.5 + 35);
    context.translate(x, y);
    context.fill(ball, "evenodd");
  }

  private drawQuarterNote(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
  ) {
    const { ball, stem } = quarterNote(context);
    context.translate(-440.95, 5.5311);
    context.translate(x, y);
    context.stroke(stem);
    context.fill(ball, "evenodd");
  }

  get bbox(): BoundingBox {
    if (!this._boundingBox) {
      throw new Error();
    }
    return this._boundingBox;
  }

  set bbox(bbox: BoundingBox) {
    this._boundingBox = bbox;
  }
}

function randomChoice<T>(elems: T[]): T {
  return elems[Math.floor(Math.random() * elems.length)];
}

function drawLines(context: CanvasRenderingContext2D): void {
  const canvasWidth = context.canvas.width;

  context.fillStyle = "#ffffff";
  context.strokeStyle = "#000000"
  context.fillRect(0, 0, canvasWidth, context.canvas.height);

  // context.lineWidth = 0;

  for (let i = 1; i < BAR_COUNT + 1; i++) {
    context.moveTo(0, i * BAR_SPACING + 50);
    context.lineTo(canvasWidth, i * BAR_SPACING + 50);
  }

  for (let i = 1; i <= canvasWidth + 1; i += canvasWidth / 4) {
    context.moveTo(Math.min(canvasWidth - 1, i), BAR_SPACING + 50);
    context.lineTo(Math.min(canvasWidth - 1, i), BAR_COUNT * BAR_SPACING + 50);
  }

  context.stroke();
  context.lineWidth = 2;
}


function pitchFromHeight(height: number): NotePitch | null {
  switch (height) {
    case -15:
      return NotePitch.A;
    case -20:
      return NotePitch.B;
    case -25:
      return NotePitch.C;
    case -30:
      return NotePitch.D;
    case 0:
      return NotePitch.E;
    case -5:
      return NotePitch.F;
    case -10:
      return NotePitch.G;
    default:
      return null;
  }
}

function isMouseInBox(pos: MousePosition, box: BoundingBox): boolean {
  return box.x <= pos.x && box.x + box.width >= pos.x && box.y <= pos.y && box.y + box.height >= pos.y;
}

function quarterNote(context: CanvasRenderingContext2D): { ball: Path2D; stem: Path2D } {
  const ball = new Path2D("m451.09 49.39c3.3958-1.82 5.2053-5.1146 4.0922-7.593-1.1873-2.6436-5.267-3.3897-9.1066-1.6654-3.8396 1.7244-5.9922 5.2694-4.8049 7.913 1.1873 2.6436 5.267 3.3897 9.1066 1.6654 0.23997-0.10777 0.48628-0.19874 0.71268-0.32007z");
  const stem = new Path2D("m454.73 43.056v-33.588");

  return { ball, stem }
}

function halfNote() {
  const ball = new Path2D("M 237.68484,218.18353 C 234.289,220.0035 232.47956,223.29808 233.59262,225.77649 C 234.77988,228.42013 238.85963,229.16621 242.6992,227.44186 C 246.53876,225.7175 248.69136,222.17246 247.5041,219.52883 C 246.31683,216.88519 242.23709,216.13911 238.39752,217.86346 C 238.15755,217.97123 237.91124,218.0622 237.68484,218.18353 z M 238.79457,220.42569 C 239.0358,220.30136 239.28005,220.20766 239.53576,220.09282 C 242.80883,218.62288 245.96997,218.55375 246.59187,219.93851 C 247.21377,221.32327 245.06209,223.64013 241.78902,225.11008 C 238.51594,226.58002 235.3548,226.64915 234.73291,225.26439 C 234.15959,223.98781 235.94804,221.89278 238.79457,220.42569 z");
  const stem = new Path2D("M 234.05234,224.51692 L 234.05234,258.10449");

  return { ball, stem }
}

function wholeNote() {
  const ball = new Path2D("m 10.091389,2.0894754 c -5.0907201,0.1822 -9.12500016,2.5826 -9.12500016,5.5 0,3.0359996 4.36800006,5.4999996 9.75000016,5.4999996 5.381999,0 9.749999,-2.464 9.749999,-5.4999996 0,-3.036 -4.368,-5.5 -9.749999,-5.5 -0.21023,0 -0.41806,-0.0074 -0.625,0 z m -1.6250001,1.0625 c 1.3579,-0.139 3.0679801,0.4906 4.4999991,1.7812 2.14502,1.9332 2.87122,4.6438998 1.625,6.0624996 l -0.03125,0.0313 c -1.27086,1.4101 -4.062299,0.9748 -6.2187491,-0.9688 -2.15645,-1.9434998 -2.86461,-4.6835996 -1.59375,-6.0936996 0.42693,-0.4737 1.03181,-0.7422 1.71875,-0.8125 z");
  return ball;
}

class Bar {
  private shouldRender: boolean = true;

  public idx: number = -1;

  public get x() {
    return this.idx * 250 + 35;
  }

  public y: number = 0;
  public offset: [number, number] = [0,0];

  constructor(
    private notes: RenderableNote[],
  ) {}

  hitNote(mousePosition: MousePosition): RenderableNote | null {
    if (!isMouseInBox(mousePosition, this.bbox)) {
      return null;
    }

    for (const note of this.notes) {
      if (isMouseInBox(mousePosition, note.bbox)) {
        return note;
      }
    }

    return null;
  }

  private drawLines(context: CanvasRenderingContext2D) {
    const canvasWidth = this.idx * 250 + 250;

    // context.fillStyle = "#ffffff";
    context.strokeStyle = "#000000"
    // context.fillRect(this.idx * 250, this.y + 50, 300, 50);

    for (let i = 1; i < BAR_COUNT + 1; i++) {
      context.moveTo(0, i * BAR_SPACING + 50 + this.y);
      context.lineTo(canvasWidth, i * BAR_SPACING + 50 + this.y);
    }

    context.moveTo(Math.min(canvasWidth - 1, this.idx * 250), BAR_SPACING + 50 + this.y);
    context.lineTo(Math.min(canvasWidth - 1, this.idx * 250), BAR_COUNT * BAR_SPACING + 50 + this.y);

    context.stroke();

  }

  render(
    context: CanvasRenderingContext2D,
    mousePosition: MousePosition,
    activeNote: RenderableNote | null,
  ) {
    this.drawLines(context);
    const mouseInBox = isMouseInBox(mousePosition, this.bbox);


    // if (!mouseInBox && !this.shouldRender) {
    //   return null;
    // }

    // this.shouldRender = false;

    let hitNote = null;

    for (let noteIdx = 0; noteIdx < this.notes.length; noteIdx += 1) {
      const note = this.notes[noteIdx]!;

      const x = this.x + noteIdx * 50;
      const y = this.y + note.heightFromPitch();

      this.adjustNoteBbox(note, x, y);
      
      const hitThisNote = note.drawNote(
        context,
        x,
        y + 50,
        mousePosition,
        activeNote === note,
        mouseInBox,
      );

      hitNote ??= hitThisNote;
    }

    return hitNote;
  }

  adjustNoteBbox(note: RenderableNote, x: number, y: number) {
    const bbox = { x: x + this.offset[0], y: y + this.offset[1], width: 14.566, height: 42 };

    switch (note.value) {
      case NoteValue.Half:
        bbox.y += 12;
        break;
      case NoteValue.Whole:
        bbox.x -= 2;
        bbox.y += 43;
        bbox.width = 25;
        bbox.height = 14;
        break;
      case NoteValue.Quarter:
      default:
        bbox.y += 12;
        break;
    }

    note.bbox = bbox;
  }

  get bbox(): BoundingBox {
    return {
      x: this.x + this.offset[0],
      y: this.y + this.offset[1],
      width: 250,
      height: 50,
    }
  }
}

function drawNotes(
  context: CanvasRenderingContext2D,
  offset: [number, number],
  mousePosition: MousePosition,
  activeNote: RenderableNote | null,
): RenderableNote | null {
  let hitNote = null;

  for (let barIdx = 0; barIdx < bars.length; barIdx++) {
    const bar = bars[barIdx];

    // const x = barIdx * 250 + 35;// + offset[0];
    const y = Math.floor(barIdx / 4) * 100; // offset[1];

    bar.idx = barIdx % 4;
    bar.y = y;
    bar.offset = offset;

    const hitThisNote = bar.render(context, mousePosition, activeNote);
    hitNote ??= hitThisNote
  }

  return hitNote;
}

const bars = [...Array(8)].map((idx, _) => (new Bar(
  [...Array(4)].map(() => (new RenderableNote({
    value: randomChoice(Object.keys(NoteValue)) as NoteValue,
    pitch: randomChoice(Object.keys(NotePitch)) as NotePitch,
  })))
)));

function useCanvas(handleClick: (a: { clientX: number, clientY: number }) => void) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [canvasOffset, setCanvasOffset] = React.useState<[number, number]>([0.0, 50.0]);

  const [context, setContext] = React.useState<CanvasRenderingContext2D | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')

    if (!canvas || !context) {
      return;
    }

    setContext(context);
    canvas.addEventListener("click", handleClick);
    return () => canvas.removeEventListener("click", handleClick);
  }, [handleClick])

  const rect = canvasRef.current?.getBoundingClientRect();

  React.useEffect(() => {
    const rect = canvasRef.current?.getBoundingClientRect();

    if (!rect) {
      return;
    }

    setCanvasOffset([rect.left, rect.top + 50]);
  }, [rect?.left, rect?.top]);


  return { canvasRef, canvasOffset, context };
}

function useMousePos() {
  const [mouseX, setMouseX] = React.useState(0.0);
  const [mouseY, setMouseY] = React.useState(0.0);

  const [isMousePressed, setIsMousePressed] = React.useState(false);

  const setMouseDown = React.useCallback(() => setIsMousePressed(true), []);
  const setMouseUp = React.useCallback(() => setIsMousePressed(false), []);

  const setMousePosition = React.useCallback(({ clientX, clientY }: { clientX: number, clientY: number }) => {
    setMouseX(clientX);
    setMouseY(clientY);
  }, []);

  React.useEffect(() => {
    document.addEventListener("mousemove", setMousePosition);
    document.addEventListener("mousedown", setMouseDown);
    document.addEventListener("mouseup", setMouseUp);
    return () => {
      document.removeEventListener("mousedown", setMouseDown);
      document.removeEventListener("mouseup", setMouseUp);
      document.removeEventListener("mousemove", setMousePosition);
    };
  });

  return { mouseX, mouseY, isMousePressed }
}

const Canvas: React.FC<{
  activeNoteValue: NoteValue | null;
  setActiveNoteValue: (v: NoteValue | null) => void;
  activeNotePitch: NotePitch | null;
  setActiveNotePitch: (v: NotePitch | null) => void;
}> = ({ activeNoteValue, setActiveNoteValue, activeNotePitch, setActiveNotePitch }) => {
  const { mouseX, mouseY, isMousePressed } = useMousePos();

  const [activeNote, setActiveNote] = React.useState<RenderableNote | null>(null);

  const handleClick = React.useCallback(({ clientX, clientY }: { clientX: number, clientY: number }) => {
    const mousePosition = { x: clientX, y: clientY };
    for (const bar of bars) {
      const note = bar.hitNote(mousePosition);
      if (note) {
        if (activeNote === note) {
          break;
        }

        setActiveNote(note);
        setActiveNoteValue(note.value);
        setActiveNotePitch(note.pitch);
        return;
      }
    }
    setActiveNote(null);
    setActiveNoteValue(null);
    setActiveNotePitch(null);
  }, [setActiveNoteValue, setActiveNotePitch, activeNote]);

  React.useEffect(() => {
    if (activeNoteValue && activeNote && activeNoteValue !== activeNote?.value) {
      activeNote.value = activeNoteValue;
    }
  }, [activeNoteValue, activeNote])

  React.useEffect(() => {
    if (activeNotePitch && activeNote && activeNotePitch !== activeNote?.pitch) {
      activeNote.pitch = activeNotePitch;
    }
  }, [activeNotePitch, activeNote])

  const { canvasRef, canvasOffset, context } = useCanvas(handleClick);

  React.useEffect(() => {
    if (!activeNotePitch || !activeNote || !isMousePressed) {
      return;
    }

    const potentialPitch = pitchFromHeight(mouseY - 50 - canvasOffset[1]);

    if (!potentialPitch || potentialPitch === activeNote?.pitch) {
      return;
    }

    setActiveNotePitch(potentialPitch);
  }, [activeNotePitch, mouseY, canvasOffset, activeNote, setActiveNotePitch, isMousePressed]);

  React.useEffect(() => {
    if (!context) {
      return;
    }

    drawLines(context);
    const hitNote = drawNotes(context, canvasOffset, { x: mouseX, y: mouseY }, activeNote);
    const canvasStyle = canvasRef.current!.style;
    if (hitNote) {
      if (isMousePressed && activeNote) {
        canvasStyle.cursor = "grabbing";
      } else {
        canvasStyle.cursor = "pointer";
      }
    } else {
      canvasStyle.cursor = "auto";
    }
  }, [mouseX, mouseY, context, canvasOffset, activeNote, activeNoteValue, isMousePressed, canvasRef]);

  return <canvas width="1000" height="1000" id="c" ref={canvasRef}></canvas>;
}

function App() {
  const [activeNoteValue, setActiveNoteValue] = React.useState<NoteValue | null>(null);
  const [activeNotePitch, setActiveNotePitch] = React.useState<NotePitch | null>(null);

  return (
    <>
      <Ribbon activeNoteValue={activeNoteValue} setActiveNoteValue={setActiveNoteValue} />
      <Canvas
        activeNoteValue={activeNoteValue}
        setActiveNoteValue={setActiveNoteValue}
        activeNotePitch={activeNotePitch}
        setActiveNotePitch={setActiveNotePitch}
      />
    </>
  );
}

export default App;
