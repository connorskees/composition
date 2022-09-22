import { BoundingBox, MousePosition, MusicalNote, NotePitch, NoteValue } from "./common";
import { isMouseInBox, isNote } from "./HelperFunctions";
import { getHalfNoteCtx, halfNotePath, getWholeNoteCtx, wholeNotePath, getQuarterNoteCtx, quarterNotePath } from "./Notes";

export class RenderableNote {
  private _boundingBox?: BoundingBox;

  yOffset: number = 0.0;

  isActive: boolean = false;

  constructor(private readonly note: MusicalNote, public id: string) {}

  public get value(): NoteValue {
    return this.note.value;
  }

  public set value(v: NoteValue) {
    this.note.value = v;
  }

  public set pitch(p: NotePitch | null) {
    if (!isNote(this.note) || p === null) {
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

    return this.note.pitch * -5;
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