import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui";

export const TestModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

// console.info("TestModal render - isOpen:", isOpen);

  return (
    <div className="p-4">
      <Button
        onClick={() => {
// console.info("Test button clicked, opening modal");
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
// console.info("Test modal closing");
            setIsOpen(false);
          }}
          title="Test Modal"
          size="sm"
          className="bg-red-500 border-8 border-blue-500"
        >
          <div className="p-4 bg-yellow-300">
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
