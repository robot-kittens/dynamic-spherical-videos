import react, { useReducer, useEffect, useRef, useState } from "react";
import logo from "./logo.svg";
import "./App.css";

import VideoPlayer from "./VideoPlayer.jsx";

const EDIT_TYPES = {
  UPDATE_OBJECT: 0,
  REMOVE_OBJECT: 1,
  ADD_TIMELINE: 2,
  REMOVE_TIMELINE: 3,
};

const initialState = {
  isDraggingObject: false,
  timeline: [],
  objects: {},
};

const editorReducer = (state, action) => {
  let nextState = state;
  console.log(action);
  switch (action.type) {
    case EDIT_TYPES["UPDATE_OBJECT"]:
      nextState = {
        ...state,
        objects: {
          ...state.objects,
          [action?.id]: {
            rect: {
              x: action?.rect?.x ?? state.objects[action?.id]?.rect?.x,
              y: action?.rect?.y ?? state.objects[action?.id]?.rect?.y,
              width:
                action?.rect?.width ?? state.objects[action?.id]?.rect?.width,
              height:
                action?.rect?.height ?? state.objects[action?.id]?.rect?.height,
            },
            options: {},
            src: action?.src ?? state.objects[action?.id]?.src,
          },
        },
      };
      break;
  }
  return nextState;
};

function App() {
  const targetObjectStartPosition = useRef(null);
  const targetObjectID = useRef(null);
  const dragStartPosition = useRef(null);

  const [isDragging, setIsDragging] = useState(false);

  const [state, dispatch] = useReducer(editorReducer, initialState);

  const [width, height] = [3840, 2160];
  const scale = Math.min(
    window.innerWidth / width,
    window.innerHeight / height
  );
  const upscale = 1.0 / scale;
  const updateObject = (id, { x, y, width, height }) =>
    dispatch({
      type: EDIT_TYPES["UPDATE_OBJECT"],
      rect: {
        x,
        y,
        width,
        height,
      },
      id,
    });
  const onAddNewTrackingObject = () =>
    updateObject(`${Math.random()}-object`, {
      x: 100,
      y: 100,
      width: 100,
      height: 100,
    });

  const onStartDragObject = (event, id) => {
    const { clientX, clientY } = event;
    const target = state.objects[id];
    if (target) {
      dragStartPosition.current = {
        clientX,
        clientY,
      };
      targetObjectID.current = id;
      targetObjectStartPosition.current = {
        x: target.rect.x,
        y: target.rect.y,
      };
    }
    setIsDragging(true);
    console.log("onStartDragObject()");
  };
  const onStopDragObject = (event) => {
    targetObjectID.current = null;
    setIsDragging(false);
  };
  const onMouseMove = ({ clientX, clientY }) => {
    if (isDragging) {
      const target = state.objects[targetObjectID.current];
      if (target) {
        const delta = {
          x: clientX - dragStartPosition.current.clientX,
          y: clientY - dragStartPosition.current.clientY,
        };

        updateObject(targetObjectID.current, {
          x: targetObjectStartPosition.current.x + delta.x * upscale,
          y: targetObjectStartPosition.current.y + delta.y * upscale,
        });
      }
    }
  };

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onStopDragObject);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onStopDragObject);
    };
  }, [isDragging, state]);

  return (
    <div className='App'>
      <div className='controls'>
        <button onClick={onAddNewTrackingObject}>
          Add new tracking object
        </button>
      </div>
      <div className='editor' style={{ transform: `scale(${scale})` }}>
        <VideoPlayer src='./Harbour.mp4' width='3840' height='2160' />
        <div className='objects'>
          {Object.keys(state.objects).map((id) => {
            const object = state.objects[id];
            if (!object) {
              return;
            }
            return (
              <figure
                // onDragStart={}
                onMouseDown={(event) => onStartDragObject(event, id)}
                // onDragEnd={}
                id={id}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: `${object.rect.width}px`,
                  height: `${object.rect.height}px`,
                  transform: `translate( ${object.rect.x}px, ${object.rect.y}px )`,
                  backgroundColor: "red",
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default App;
