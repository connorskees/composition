import './App.scss';
import React from 'react';
import { Ribbon } from './Ribbon';
import { MousePosition, NoteValue, valueToInteger } from './common';
import { v4 as uuidv4 } from 'uuid';
import {
  SharedString, ContainerSchema, IFluidContainer, ConnectionState } from "fluid-framework";
import { TinyliciousClient } from "@fluidframework/tinylicious-client";
import { drawLines, randomChoice, pitchFromHeight } from './HelperFunctions';
import { RenderableNote } from './RenderableNote';
import { Bar } from './Bar';

const useSharedString = (): SharedString | undefined => {
  const [sharedString, setSharedString] = React.useState<SharedString>();
  const getFluidData = async () => {
    // Configure the container.
    const client: TinyliciousClient = new TinyliciousClient();
    const containerSchema: ContainerSchema = {
      initialObjects: { sharedString: SharedString }
    }

    // Get the container from the Fluid service.
    let container: IFluidContainer;
    const containerId = window.location.hash.substring(1);
    if (!containerId) {
      ({ container } = await client.createContainer(containerSchema));
      const id = await container.attach();
      window.location.hash = id;
      // Return the Fluid SharedString object.
      return container.initialObjects.sharedString as SharedString;
    }

    ({ container } = await client.getContainer(containerId, containerSchema));
    if (container.connectionState !== ConnectionState.Connected) {
      await new Promise<void>((resolve) => {
        container.once("connected", () => {
          resolve();
        });
      });
    }
    // Return the Fluid SharedString object.
    return container.initialObjects.sharedString as SharedString;
  }

  // Get the Fluid Data data on app startup and store in the state
  React.useEffect(() => {
    getFluidData()
      .then((data) => setSharedString(data));
  }, []);

  return sharedString as SharedString;
}

const linesRendered = new Set();
const hasRendered = new Set();

function drawNotes(
  context: CanvasRenderingContext2D,
  sharedString: SharedString,
  offset: [number, number],
  mousePosition: MousePosition,
): string | null {
  let hitNote = null;

  const skipped = new Set();

  const barCount = sharedString.getContainingSegment(sharedString.getLength() - 1).segment?.properties?.barIdx ?? 0;

  for (let barIdx = 0; barIdx < barCount + 1; barIdx += 4) {
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

  let barIdxOffset = 0;


  for (let barIdx = 0; barIdx < barCount + 1; barIdx++) {
    const bar = bars[barIdx];

    if (!bar) {
      break;
    }

    const y = Math.floor(barIdx / 4) * 100;

    if (skipped.has(barIdx)) {
      barIdxOffset += bar.len;
      continue;
    }

    hasRendered.add(barIdx);

    bar.idx = barIdx % 4;
    bar.y = y;
    bar.offset = offset;

    const hitThisNote = bar.render(context, sharedString, barIdxOffset, mousePosition, barIdx);
    barIdxOffset += bar.len;
    hitNote ??= hitThisNote
  }

  return hitNote;
}

function getInitBars(barCount: number): Bar[] {
  const bars = [];

  for (let i = 0; i < barCount; i += 1) {
    const bar = new Bar([]);
    let barValue = 4;

    while (barValue > 0) {
      const value = randomChoice(Object.keys(NoteValue)) as NoteValue;
      const valAsInt = valueToInteger(value);

      if (barValue - valAsInt < 0) {
        continue;
      }

      const pitch = randomChoice([-1, 0, 1, 2, 3, 4, 5, 6, 7]);

      barValue -= valAsInt;

      bar.notes.push(new RenderableNote({ value, pitch }, uuidv4()));
    }

    bars.push(bar);
  }

  return bars;
}

const bars = getInitBars(20);

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

export function findIndex(sharedString: SharedString, id: string): number | null {
  for (let i = 0; i < sharedString.getLength(); i++) {
    if (sharedString.getContainingSegment(i).segment.properties?.id === id) {
      return i;
    }
  }

  return null;
}

const Canvas: React.FC<{
  sharedString: SharedString,
  activeNote: string | null,
  setActiveNote: (n: string | null) => void;
  activeNoteValue: NoteValue | null;
  setActiveNoteValue: (v: NoteValue | null) => void;
  forceRerender: boolean;
}> = ({ sharedString, activeNote, setActiveNote, activeNoteValue, forceRerender }) => {
  const { mouseX, mouseY, isMousePressed, scrollPos } = useMousePos();

  const [hoveredNote, setHoveredNote] = React.useState<string | null>(null);

  const handleClick = React.useCallback(({ clientX, clientY }: { clientX: number, clientY: number }) => {
    if (activeNote === hoveredNote) {
      return;
    }

    
    if (activeNote !== null && sharedString) {
      const activeNoteIdx = findIndex(sharedString, activeNote);
      if (activeNoteIdx !== null) {
        sharedString.annotateRange(activeNoteIdx, activeNoteIdx + 1, { isActive: false });
      }
    }

    if (hoveredNote === null) {
      setActiveNote(null);
      return;
    }

    if (sharedString) {
      const hoveredNoteIdx = findIndex(sharedString, hoveredNote);
      if (hoveredNoteIdx !== null) {
        sharedString.annotateRange(hoveredNoteIdx, hoveredNoteIdx + 1, { isActive: true });
      }
    }

    setActiveNote(hoveredNote);
  }, [activeNote, hoveredNote, sharedString, setActiveNote]);

  const { canvasRef, canvasOffset, context } = useCanvas(handleClick);

  // modify pitch
  React.useEffect(() => {
    if (activeNote === null || !isMousePressed || (hoveredNote !== null && hoveredNote !== activeNote)) {
      return;
    }

    const activeNoteIdx = findIndex(sharedString, activeNote);

    if (activeNoteIdx === null) {
      return;
    }

    const potentialPitch = pitchFromHeight(mouseY - 50 - canvasOffset[1] - Math.floor(activeNoteIdx / 16) * 100);

    const segment = sharedString.getContainingSegment(activeNoteIdx);
    const { pitch } = segment?.segment?.properties ?? {};

    if (potentialPitch === null || potentialPitch === pitch || pitch === undefined) {
      return;
    }

    sharedString.annotateRange(activeNoteIdx, activeNoteIdx + 1, { pitch: potentialPitch });
  }, [sharedString, mouseY, canvasOffset, activeNote, isMousePressed, hoveredNote]);

  // draw notes+bars
  React.useEffect(() => {
    if (!context) {
      return;
    }

    const hitNote = drawNotes(context, sharedString, canvasOffset, { x: mouseX, y: mouseY });
    setHoveredNote(hitNote);
    const canvasStyle = canvasRef.current!.style;
    if (hitNote) {
      canvasStyle.cursor = "pointer";
    } else {
      canvasStyle.cursor = "auto";
    }
  }, [sharedString, mouseX, mouseY, context, canvasOffset, activeNote, isMousePressed, canvasRef, scrollPos, activeNoteValue, forceRerender]);

  return <canvas width="1000" height="1000" ref={canvasRef}></canvas>;
}

function getActiveNote(sharedString: SharedString | undefined): string | null {
  if (!sharedString) {
    return null;
  }
  for (let i = 0; i < sharedString.getLength(); i++) {
    const props = sharedString.getContainingSegment(i).segment.properties;
    if (props?.isActive) {
      return props.id ?? null;
    }
  }
  return null;
}

function App() {
  const sharedString = useSharedString();

  const [activeNote, setActiveNote] = React.useState<string | null>(null);
  const [activeNoteValue, setActiveNoteValue] = React.useState<NoteValue | null>(null);

  const [forceRerender, setForceRerender] = React.useState(false);

  React.useEffect(() => {
    setActiveNote(getActiveNote(sharedString));
  }, [sharedString]);

  React.useEffect(() => {
    if (activeNote === null || !sharedString) {
      setActiveNoteValue(null);
      return;
    }

    const activeNoteIdx = findIndex(sharedString, activeNote);

    if (activeNoteIdx === null) {
      return;
    }

    const segment = sharedString.getContainingSegment(activeNoteIdx);
    const { value } = segment?.segment.properties ?? {};

    setActiveNoteValue(value);
  }, [activeNote, sharedString])
  
  React.useEffect(() => {
    // initial creation 
    if (!sharedString) {
      return;
    }
    // reload/new tab - sharedString exists
    if (sharedString.getLength() > 0) {
      return;
    }
    let barIdx = 0;
    for (const bar of bars) {
      for (const note of bar.notes) {
        const len = sharedString.getLength();

        sharedString.insertText(len, 'X');
        sharedString.annotateRange(
          len,
          len + 1,
          { barIdx, value: note.value, pitch: note.pitch, id: uuidv4() }
        );
      }
      barIdx += 1;
    }
  }, [sharedString]);

  const addNote = React.useCallback(() => {
    if (!sharedString || activeNote === null) {
      return;
    }

    let idx = findIndex(sharedString, activeNote);

    if (idx === null) {
      return;
    }

    const barIdx = sharedString.getContainingSegment(idx).segment?.properties?.barIdx ?? 0;

    if (bars[barIdx].len === 8) {
      return;
    }

    idx += 1;

    sharedString.insertText(idx, 'X');
    sharedString.annotateRange(idx, idx + 1, { barIdx, value: NoteValue.Quarter, pitch: 0, id: uuidv4() });

    setForceRerender(v => !v);
  }, [sharedString, activeNote]);

  const deleteNote = React.useCallback(() => {
    if (!sharedString || activeNote === null) {
      return;
    }

    const idx = findIndex(sharedString, activeNote);

    if (idx === null) {
      return;
    }

    const barIdx = sharedString.getContainingSegment(idx).segment?.properties?.barIdx ?? 0;

    if (bars[barIdx].len === 1) {
      return;
    }

    sharedString.removeRange(idx, idx + 1);
    setActiveNote(null);
  }, [sharedString, activeNote]);

  return (
    <>
      <Ribbon
        sharedString={sharedString}
        activeNoteValue={activeNoteValue ?? null}
        setActiveNoteValue={setActiveNoteValue}
        activeNoteId={activeNote}
        setActiveNote={setActiveNote}
        addNote={addNote}
        deleteNote={deleteNote}
      />
      {sharedString && <Canvas
        sharedString={sharedString}
        activeNoteValue={activeNoteValue ?? null}
        setActiveNoteValue={setActiveNoteValue}
        activeNote={activeNote}
        setActiveNote={setActiveNote}
        forceRerender={forceRerender}
      />}
    </>
  );
}

export default App;
