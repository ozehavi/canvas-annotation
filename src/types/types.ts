interface Rectangle {
    x: number;
    y: number;
    width: number;
    height: number;
    name: string;
  }
  
  interface Position {
    x: number;
    y: number;
  }
  
  interface DrawingState {
    isDrawing: boolean;
    startPosition: Position | null;
    currentRectangle: Omit<Rectangle, 'name'> | null;
  }
  
  interface NamePromptState {
    isOpen: boolean;
    name: string;
  }
  
  interface CanvasAnnotationsProps {
    floorPlanImage: string;
  }