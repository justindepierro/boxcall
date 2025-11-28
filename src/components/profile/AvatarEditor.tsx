import React, { useState, useRef, useCallback } from "react";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { useMobileModal } from "../../hooks/useMobileModal";
import { Typography } from "../design-system/Typography";
import { ZoomIn, ZoomOut, RotateCw, Move, Crop } from "lucide-react";

interface AvatarEditorProps {
  isOpen: boolean;
  onClose: () => void;
  imageFile: File;
  onSave: (croppedBlob: Blob) => void;
}

export const AvatarEditor: React.FC<AvatarEditorProps> = ({
  isOpen,
  onClose,
  imageFile,
  onSave,
}) => {
  const [imageUrl, setImageUrl] = useState<string>("");
  const modalSize = useMobileModal("lg");
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Load image when file changes
  React.useEffect(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageUrl(e.target?.result as string);
      };
      reader.readAsDataURL(imageFile);
    }
  }, [imageFile]);

  // Handle zoom
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.5));
  };

  // Handle rotation
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Handle drag start
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  // Handle drag move
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;

      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    },
    [isDragging, dragStart]
  );

  // Handle drag end
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Reset to defaults
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  // Crop and save image
  const handleSaveCrop = async () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    // Set canvas size for square output
    const size = 400; // Output size
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Save context state
    ctx.save();

    // Move to center
    ctx.translate(size / 2, size / 2);

    // Apply rotation
    ctx.rotate((rotation * Math.PI) / 180);

    // Apply zoom and draw image centered
    const scaledWidth = image.width * zoom;
    const scaledHeight = image.height * zoom;

    ctx.drawImage(
      image,
      -scaledWidth / 2 + position.x,
      -scaledHeight / 2 + position.y,
      scaledWidth,
      scaledHeight
    );

    // Restore context
    ctx.restore();

    // Convert to blob
    canvas.toBlob(
      (blob) => {
        if (blob) {
          onSave(blob);
          onClose();
        }
      },
      "image/jpeg",
      0.9
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Avatar"
      size={modalSize}
    >
      <div className="p-md">
        {/* Preview Area */}
        <div className="relative bg-secondary rounded-lg overflow-hidden mb-md">
          {/* Crop Circle Overlay - Dark outside, clear inside */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="relative w-80 h-80">
              {/* This creates dark overlay OUTSIDE the circle using inverted box-shadow */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.7)",
                }}
              />
              {/* Circle border */}
              <div className="absolute inset-0 rounded-full border-4 border-white/80" />
            </div>
          </div>

          {/* Image Container */}
          <div
            className="relative w-full h-96 flex items-center justify-center cursor-move"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {imageUrl && (
              <img
                ref={imageRef}
                src={imageUrl}
                alt="Avatar preview"
                className="max-w-full max-h-full object-contain"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg) translate(${position.x}px, ${position.y}px)`,
                  transition: isDragging ? "none" : "transform 0.1s ease-out",
                }}
                draggable={false}
              />
            )}
          </div>
        </div>

        {/* Help Text */}
        <div className="flex items-center justify-center gap-2 mb-md text-secondary">
          <Move className="w-4 h-4" />
          <Typography variant="body-xs">
            Drag to position • Zoom to size • Rotate to adjust
          </Typography>
        </div>

        {/* Controls */}
        <div className="space-y-md">
          {/* Zoom Controls */}
          <div className="flex items-center gap-md">
            <Typography variant="body-sm" className="w-20 font-medium">
              Zoom
            </Typography>
            <div className="flex items-center gap-sm flex-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoom <= 0.5}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoom >= 3}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Typography variant="body-xs" className="w-12 text-right">
                {Math.round(zoom * 100)}%
              </Typography>
            </div>
          </div>

          {/* Rotation Control */}
          <div className="flex items-center gap-md">
            <Typography variant="body-sm" className="w-20 font-medium">
              Rotate
            </Typography>
            <div className="flex items-center gap-sm flex-1">
              <Button variant="outline" size="sm" onClick={handleRotate}>
                <RotateCw className="w-4 h-4 mr-2" />
                Rotate 90°
              </Button>
              <Typography variant="body-xs" className="w-12 text-right">
                {rotation}°
              </Typography>
            </div>
          </div>

          {/* Reset Button */}
          <div className="flex justify-center pt-sm">
            <Button variant="ghost" size="sm" onClick={handleReset}>
              Reset to Original
            </Button>
          </div>
        </div>

        {/* Hidden Canvas for Cropping */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Action Buttons */}
        <div className="flex justify-end gap-sm mt-lg pt-md border-t border-bg-secondary">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSaveCrop}>
            <Crop className="w-4 h-4 mr-2" />
            Crop & Save
          </Button>
        </div>
      </div>
    </Modal>
  );
};
