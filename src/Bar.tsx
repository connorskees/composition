import { SharedString } from "fluid-framework";
import { MousePosition, MusicalNote, NoteValue, BoundingBox } from "./common";
import { isMouseInBox } from "./HelperFunctions";
import { RenderableNote } from "./RenderableNote";

export class Bar {
  public idx: number = -1;

  public get x() {
    return this.idx * 250 + 35;
  }

  public hasActiveOrHovered = false;

  public y: number = 0;
  public offset: [number, number] = [0,0];
  public len: number = 0;

  constructor(
    public notes: RenderableNote[],
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
    sharedString: SharedString,
    noteIdxOffset: number,
    mousePosition: MousePosition,
    barIdx: number,
  ): string | null {
    const mouseInBox = isMouseInBox(mousePosition, this.bbox);

    let hitNote = null;

    this.hasActiveOrHovered = false;
   
    const notes = [];

    let noteIdx = 0;
    let props = sharedString.getContainingSegment(noteIdx + noteIdxOffset).segment?.properties;
    
    while (props?.barIdx === barIdx) {
      if (!props) {
        throw new Error();
      }

      notes.push(props);

      noteIdx += 1;
      props = sharedString.getContainingSegment(noteIdx + noteIdxOffset).segment?.properties;
    }
    
    for (let i = 0; i < notes.length; i++) {
      const props = notes[i];

      const note = new RenderableNote(props as MusicalNote, props!.id);

      const spaceBetween = (250 - 70 - 20 * notes.length) / (notes.length - 1);

      const x = notes.length > 1
        ? this.idx * 250 + 35 + i * spaceBetween + i * 20
        : this.idx * 250 + 250 / 2;
      const y = this.y + note.heightFromPitch();

      this.adjustNoteBbox(note, x, y);

      note.yOffset = this.y;

      const isActive = !!props?.isActive;

      this.hasActiveOrHovered ||= isActive;
      
      const hitThisNote = note.drawNote(
        context,
        x,
        y + 50,
        mousePosition,
        isActive,
        mouseInBox,
      );

      hitNote ??= hitThisNote ? note.id : null;
    }

    this.hasActiveOrHovered ||= !!hitNote;

    this.len = noteIdx;

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
      y: this.y + this.offset[1] - 25,
      width: 250,
      height: 100,
    }
  }
}
