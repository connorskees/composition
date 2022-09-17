import './App.scss';
import React from 'react';
import { Ribbon } from './Ribbon';
import { BoundingBox, MousePosition, MusicalNote, Note, NotePitch, NoteValue } from './common';
import { getHalfNoteCtx, getQuarterNoteCtx, getWholeNoteCtx, halfNotePath, quarterNotePath, wholeNotePath } from './Notes';

function isNote(note: MusicalNote): note is Note {
  return "pitch" in note;
}

const linesRendered = new Set();

function drawLines(context: CanvasRenderingContext2D, y: number): void {
  const canvasWidth = context.canvas.width;

  context.fillStyle = "#ffffff";
  context.strokeStyle = "#000000"
  context.fillRect(0, y + 25, canvasWidth, 95);

  // context.lineWidth = 0;

  for (let i = 1; i < BAR_COUNT + 1; i++) {
    context.moveTo(0, i * BAR_SPACING + 50 + y);
    context.lineTo(canvasWidth, i * BAR_SPACING + 50 + y);
  }

  for (let i = 1; i <= canvasWidth + 1; i += canvasWidth / 4) {
    context.moveTo(Math.min(canvasWidth - 1, i), BAR_SPACING + 50 + y);
    context.lineTo(Math.min(canvasWidth - 1, i), BAR_COUNT * BAR_SPACING + 50 + y);
  }

  context.stroke();
  context.lineWidth = 2;
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
    // context.strokeStyle = "#ff0000"
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
    if (context.strokeStyle === "#000000") {
      const ctx = getHalfNoteCtx();
      context.drawImage(ctx.canvas, x, y);
    } else {
      const { ball, stem } = halfNotePath();
      context.transform(-1, 0, 0, -1, 247.5, 272);
      context.translate(-x, -y);
      // context.strokeRect(x, y, 14.566, 41.17);
      context.stroke(stem);
      context.fill(ball, "evenodd");
    }
  }

  private drawWholeNote(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
  ) {
    if (context.strokeStyle === "#000000") {
      const ctx = getWholeNoteCtx();
      context.drawImage(ctx.canvas, x, y);
    } else {
      const ball = wholeNotePath();
      context.translate(0, 7.5 + 35);
      context.translate(x, y);
      context.fill(ball, "evenodd");
    }
  }

  private drawQuarterNote(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
  ) {
    if (context.strokeStyle === "#000000") {
      const ctx = getQuarterNoteCtx();
      context.drawImage(ctx.canvas, x, y);
    } else {
      const { ball, stem } = quarterNotePath();
      context.translate(-440.95, 5.5311);
      context.translate(x, y);
      context.stroke(stem);
      context.fill(ball, "evenodd");
    }
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

class Bar {
  public idx: number = -1;

  public get x() {
    return this.idx * 250 + 35;
  }

  public hasActiveOrHovered = false;

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

  render(
    context: CanvasRenderingContext2D,
    mousePosition: MousePosition,
    activeNote: RenderableNote | null,
  ) {
    const mouseInBox = isMouseInBox(mousePosition, this.bbox);

    let hitNote = null;

    this.hasActiveOrHovered = false;

    for (let noteIdx = 0; noteIdx < this.notes.length; noteIdx += 1) {
      const note = this.notes[noteIdx];

      const x = this.x + noteIdx * 50;
      const y = this.y + note.heightFromPitch();

      this.adjustNoteBbox(note, x, y);

      const isActive = activeNote === note;

      this.hasActiveOrHovered ||= isActive;
      
      const hitThisNote = note.drawNote(
        context,
        x,
        y + 50,
        mousePosition,
        isActive,
        mouseInBox,
      );

      hitNote ??= hitThisNote;
    }

    this.hasActiveOrHovered ||= !!hitNote;

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

const hasRendered = new Set();

function drawNotes(
  context: CanvasRenderingContext2D,
  offset: [number, number],
  mousePosition: MousePosition,
  activeNote: RenderableNote | null,
): RenderableNote | null {
  let hitNote = null;

  const skipped = new Set();

  for (let barIdx = 0; barIdx < bars.length; barIdx += 4) {
    const barsRange = bars.slice(barIdx, barIdx + 4);
    const y = Math.floor(barIdx / 4) * 100;

    if (
      (mousePosition.y - 100 > y + offset[1] || mousePosition.y + 100 < y + offset[1])
      && linesRendered.has(barIdx)
      && !barsRange.some(bar => bar.hasActiveOrHovered)
    ) {
      skipped.add(barIdx);
      skipped.add(barIdx+1);
      skipped.add(barIdx+2);
      skipped.add(barIdx+3);
      continue;
    }

    linesRendered.add(barIdx);

    drawLines(context, y);
  }

  for (let barIdx = 0; barIdx < bars.length; barIdx++) {
    const bar = bars[barIdx];

    const y = Math.floor(barIdx / 4) * 100;

    if (skipped.has(barIdx)) {
      continue;
    }

    hasRendered.add(barIdx);

    bar.idx = barIdx % 4;
    bar.y = y;
    bar.offset = offset;

    const hitThisNote = bar.render(context, mousePosition, activeNote);
    hitNote ??= hitThisNote
  }

  return hitNote;
}

const bars = [...Array(800)].map((idx, _) => (new Bar(
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

  const [scrollPos, setScrollPos] = React.useState(0);

  const setMouseDown = React.useCallback(() => setIsMousePressed(true), []);
  const setMouseUp = React.useCallback(() => setIsMousePressed(false), []);

  const setMousePosition = React.useCallback(({ clientX, clientY }: { clientX: number, clientY: number }) => {
    setMouseX(clientX);
    setMouseY(clientY);
  }, []);

  const setMouseScroll = React.useCallback(() => {
    setScrollPos(p => p + 1);
  }, []);

  React.useEffect(() => {
    document.addEventListener("mousemove", setMousePosition);
    document.addEventListener("mousedown", setMouseDown);
    document.addEventListener("mouseup", setMouseUp);
    document.addEventListener("scroll", setMouseScroll);
    return () => {
      document.removeEventListener("mousedown", setMouseDown);
      document.removeEventListener("mouseup", setMouseUp);
      document.removeEventListener("mousemove", setMousePosition);
      document.removeEventListener("scroll", setMouseScroll);
    };
  });

  return { mouseX, mouseY, isMousePressed, scrollPos }
}

const Canvas: React.FC<{
  activeNoteValue: NoteValue | null;
  setActiveNoteValue: (v: NoteValue | null) => void;
  activeNotePitch: NotePitch | null;
  setActiveNotePitch: (v: NotePitch | null) => void;
}> = ({ activeNoteValue, setActiveNoteValue, activeNotePitch, setActiveNotePitch }) => {
  const { mouseX, mouseY, isMousePressed, scrollPos } = useMousePos();

  const [activeNote, setActiveNote] = React.useState<RenderableNote | null>(null);
  const [hoveredNote, setHoveredNote] = React.useState<RenderableNote | null>(null);

  const handleClick = React.useCallback(({ clientX, clientY }: { clientX: number, clientY: number }) => {
    if (activeNote === hoveredNote) {
      return;
    }

    setActiveNote(hoveredNote);

    if (hoveredNote) {
      setActiveNoteValue(hoveredNote.value);
      setActiveNotePitch(hoveredNote.pitch);
    } else {
      setActiveNoteValue(null);
      setActiveNotePitch(null);
    }
  }, [setActiveNoteValue, setActiveNotePitch, activeNote, hoveredNote]);

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

    const hitNote = drawNotes(context, canvasOffset, { x: mouseX, y: mouseY }, activeNote);
    setHoveredNote(hitNote);
    const canvasStyle = canvasRef.current!.style;
    if (hitNote) {
      canvasStyle.cursor = "pointer";
    } else {
      canvasStyle.cursor = "auto";
    }
  }, [mouseX, mouseY, context, canvasOffset, activeNote, activeNoteValue, isMousePressed, canvasRef, scrollPos]);

  return <canvas width="1000" height="1000" ref={canvasRef}></canvas>;
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
