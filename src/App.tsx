import './App.scss';
import React from 'react';
import { Ribbon } from './Ribbon';
import { MousePosition, NoteValue } from './common';

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
): number | null {
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

    const hitThisNote = bar.render(context, sharedString, barIdx * 4, mousePosition);
    hitNote ??= hitThisNote
  }

  return hitNote;
}

const bars = [...Array(20)].map((idx, _) => (new Bar(
  [...Array(4)].map(() => (new RenderableNote({
    value: randomChoice(Object.keys(NoteValue)) as NoteValue,
    pitch: randomChoice([-1, 0, 1, 2, 3, 4, 5, 6, 7])
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
  sharedString: SharedString,
  activeNote: number | null,
  setActiveNote: (n: number | null) => void;
  activeNoteValue: NoteValue | null;
  setActiveNoteValue: (v: NoteValue | null) => void;
}> = ({ sharedString, activeNote, setActiveNote, activeNoteValue }) => {
  const { mouseX, mouseY, isMousePressed, scrollPos } = useMousePos();

  const [hoveredNote, setHoveredNote] = React.useState<number | null>(null);

  const handleClick = React.useCallback(({ clientX, clientY }: { clientX: number, clientY: number }) => {
    if (activeNote === hoveredNote) {
      return;
    }

    if (activeNote !== null) {
      sharedString?.annotateRange(activeNote, activeNote + 1, { isActive: false });
    }

    if (hoveredNote === null) {
      setActiveNote(null);
      return;
    }

    sharedString?.annotateRange(hoveredNote, hoveredNote + 1, { isActive: true });

    setActiveNote(hoveredNote);
  }, [activeNote, hoveredNote, sharedString, setActiveNote]);

  const { canvasRef, canvasOffset, context } = useCanvas(handleClick);

  // modify pitch
  React.useEffect(() => {
    if (activeNote === null || !isMousePressed || (hoveredNote !== null && hoveredNote !== activeNote)) {
      return;
    }

    const potentialPitch = pitchFromHeight(mouseY - 50 - canvasOffset[1] - Math.floor(activeNote / 16) * 100); //  - activeNote.yOffset

    const segment = sharedString.getContainingSegment(activeNote);
    const { pitch } = segment?.segment?.properties ?? {};

    if (potentialPitch === null || potentialPitch === pitch || pitch === undefined) {
      return;
    }

    sharedString.annotateRange(activeNote, activeNote + 1, { pitch: potentialPitch });
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
  }, [sharedString, mouseX, mouseY, context, canvasOffset, activeNote, isMousePressed, canvasRef, scrollPos, activeNoteValue]);

  return <canvas width="1000" height="1000" ref={canvasRef}></canvas>;
}

function getActiveNote(sharedString: SharedString | undefined): number | null {
  if (!sharedString) {
    return null;
  }
  for (let i = 0; i < sharedString.getLength(); i++) {
    if (sharedString.getContainingSegment(i).segment.properties?.isActive) {
      return i;
    }
  }
  return null;
}

function App() {
  const sharedString = useSharedString();

  const [activeNote, setActiveNote] = React.useState<number | null>(null);
  const [activeNoteValue, setActiveNoteValue] = React.useState<NoteValue | null>(null);

  React.useEffect(() => {
    setActiveNote(getActiveNote(sharedString));
  }, [sharedString]);

  React.useEffect(() => {
    const segment = activeNote === null ? null : sharedString?.getContainingSegment(activeNote);
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
    for (const bar of bars) {
      for (const note of bar.notes) {
        const len = sharedString.getLength();

        sharedString.insertText(len, 'X');
        sharedString.annotateRange(len, len + 1, { value: note.value, pitch: note.pitch });
      }
    }
  }, [sharedString]);

  return (
    <>
      <Ribbon
        sharedString={sharedString}
        activeNoteValue={activeNoteValue ?? null}
        setActiveNoteValue={setActiveNoteValue}
        activeNote={activeNote}
        setActiveNote={setActiveNote}
      />
      {sharedString && <Canvas
        sharedString={sharedString}
        activeNoteValue={activeNoteValue ?? null}
        setActiveNoteValue={setActiveNoteValue}
        activeNote={activeNote}
        setActiveNote={setActiveNote}
      />}
    </>
  );
}

export default App;
