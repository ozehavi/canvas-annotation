import React, { useEffect, useRef, useState } from 'react';
import floorPlanImage from './Sample_Floorplan.png';

const App = () => {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [rectangles, setRectangles] = useState([]);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [tempRectangle, setTempRectangle] = useState(null);
  const [newRectangleName, setNewRectangleName] = useState('');

  useEffect(() => {
    const savedRectangles = JSON.parse(localStorage.getItem('rectangles')) || [];
    setRectangles(savedRectangles);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const image = new Image();
    image.src = floorPlanImage;
    imageRef.current = image;

    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);
      drawRectangles(ctx, savedRectangles);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (imageRef.current) {
      ctx.drawImage(imageRef.current, 0, 0);
    }
    drawRectangles(ctx, rectangles);
    
    if (tempRectangle) {
      ctx.strokeStyle = 'rgba(0, 123, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(
        tempRectangle.x,
        tempRectangle.y,
        tempRectangle.width,
        tempRectangle.height
      );
    }
  }, [rectangles, tempRectangle]);

  const drawRectangles = (ctx, rectangles) => {
    rectangles.forEach((rect) => {
      ctx.strokeStyle = 'rgba(0, 123, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);

      ctx.setLineDash([]);
      ctx.font = '14px Arial';
      const textMetrics = ctx.measureText(rect.name);
      const textWidth = textMetrics.width;
      const textHeight = 14; 
      const padding = 4;
      
      const textX = rect.x;
      const textY = rect.y - 10;

      ctx.fillStyle = 'rgb(68 132 215)';
      ctx.fillRect(
        textX,
        textY - textHeight - padding,
        textWidth + (padding * 2),
        textHeight + (padding * 2)
      );

      ctx.fillStyle = 'white';
      ctx.fillText(rect.name, textX + padding, textY - padding);
    });
  };

  const getMousePosition = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (event) => {
    event.preventDefault();
    const pos = getMousePosition(event);
    setIsDrawing(true);
    setStartPosition(pos);
  };

  const handleMouseMove = (event) => {
    if (!isDrawing) return;

    event.preventDefault();
    const currentPos = getMousePosition(event);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (imageRef.current) {
      ctx.drawImage(imageRef.current, 0, 0);
    }

    drawRectangles(ctx, rectangles);

    ctx.strokeStyle = 'rgba(0, 123, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(
      startPosition.x,
      startPosition.y,
      currentPos.x - startPosition.x,
      currentPos.y - startPosition.y
    );
  };

  const handleMouseUp = (event) => {
    if (!isDrawing) return;

    setIsDrawing(false);
    const endPosition = getMousePosition(event);
    const newRect = {
      x: Math.min(startPosition.x, endPosition.x),
      y: Math.min(startPosition.y, endPosition.y),
      width: Math.abs(endPosition.x - startPosition.x),
      height: Math.abs(endPosition.y - startPosition.y),
    };
    setTempRectangle(newRect);
    setShowNamePrompt(true);
  };

  const handleNameSubmit = () => {
    if (tempRectangle && newRectangleName.trim()) {
      const newRectangle = {
        ...tempRectangle,
        name: newRectangleName.trim(),
      };
      const updatedRectangles = [...rectangles, newRectangle];
      setRectangles(updatedRectangles);
      localStorage.setItem('rectangles', JSON.stringify(updatedRectangles));
      
      setTempRectangle(null);
      setNewRectangleName('');
      setShowNamePrompt(false);
    }
  };

  const handleCancel = () => {
    setShowNamePrompt(false);
    setTempRectangle(null);
    setNewRectangleName('');
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (imageRef.current) {
      ctx.drawImage(imageRef.current, 0, 0);
    }
    drawRectangles(ctx, rectangles);
  };

  const handleRename = (index, newName) => {
    const updatedRectangles = rectangles.map((rect, i) =>
      i === index ? { ...rect, name: newName } : rect
    );
    setRectangles(updatedRectangles);
    localStorage.setItem('rectangles', JSON.stringify(updatedRectangles));
  };

  const handleDelete = (index) => {
    const updatedRectangles = rectangles.filter((_, i) => i !== index);
    setRectangles(updatedRectangles);
    localStorage.setItem('rectangles', JSON.stringify(updatedRectangles));
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleNameSubmit();
    } else if (event.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className="flex items-start gap-6 p-4">
      <div className="relative flex-shrink-0">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="border border-gray-300 cursor-crosshair"
        />
        {showNamePrompt && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded shadow-lg border border-gray-300 w-64">
            <input
              type="text"
              value={newRectangleName}
              onChange={(e) => setNewRectangleName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter rectangle name"
              className="border border-gray-300 p-2 mb-2 w-full rounded"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleNameSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                disabled={!newRectangleName.trim()}
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="flex-1 max-w-md overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Rectangles</h3>
        <div className="grid gap-4">
          {rectangles.map((rect, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <p className="font-medium mb-2 break-all">
                {rect.name}
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                <div>
                  <span className="font-medium">Position:</span> ({rect.x.toFixed(1)}, {rect.y.toFixed(1)})
                </div>
                <div>
                  <span className="font-medium">Size:</span> {Math.abs(rect.width).toFixed(1)} × {Math.abs(rect.height).toFixed(1)}
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={rect.name}
                  onChange={(e) => handleRename(index, e.target.value)}
                  className="flex-1 min-w-0 border border-gray-300 p-2 rounded text-sm"
                />
                <button
                  onClick={() => handleDelete(index)}
                  className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm flex-shrink-0"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;