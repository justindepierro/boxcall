import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui";

export const TestModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-4">
      <Button
        onClick={() => {
          setIsOpen(true);
        }}
        variant="primary"
      >
        Open Test Modal
      </Button>

      {isOpen && (
        <Modal
          isOpen={true}
          onClose={() => {
            setIsOpen(false);
          }}
          title="Test Modal"
          size="sm"
          className="bg-text-error border-8 border-text-info"
        >
          <div className="p-4 bg-warning/20">
            <p>This is a test modal to debug rendering issues.</p>
            <Button onClick={() => setIsOpen(false)} className="mt-2">
              Close
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};
