import { BoundingBox, MousePosition, MusicalNote, Note, NotePitch } from "./common";

export function isNote(note: MusicalNote): note is Note {
    return !!note && "pitch" in note;
}

export function drawLines(context: CanvasRenderingContext2D, y: number): void {
  const canvasWidth = context.canvas.width;

  context.fillStyle = "#ffffff";
  context.strokeStyle = "#000000"
  context.fillRect(0, y + 20, canvasWidth, 100);

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

export function randomChoice<T>(elems: T[]): T {
    return elems[Math.floor(Math.random() * elems.length)];
}

export function pitchFromHeight(height: number): NotePitch | null {
    if (height < -45) {
        return null;
    }

    if (height > 5) {
        return null;
    }

    return Math.floor(height / -5);
}

export function isMouseInBox(pos: MousePosition, box: BoundingBox): boolean {
    return box.x <= pos.x && box.x + box.width >= pos.x && box.y <= pos.y && box.y + box.height >= pos.y;
}
