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
    ) {
      const mouseInBox = isMouseInBox(mousePosition, this.bbox);
  
      let hitNote = null;
  
      this.hasActiveOrHovered = false;
  
      for (let noteIdx = 0; noteIdx < 4; noteIdx += 1) {
        const segment = sharedString.getContainingSegment(noteIdx + noteIdxOffset);
        const props = segment.segment?.properties;
  
        const note = new RenderableNote(props as MusicalNote);
  
        const x = this.x + noteIdx * 50;
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
  
        hitNote ??= hitThisNote ? noteIdx + noteIdxOffset : null;
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
        y: this.y + this.offset[1] - 25,
        width: 250,
        height: 100,
      }
    }
  }