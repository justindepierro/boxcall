import React from "react";

export const MinimalGridTest: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 p-4">
    <div className="bg-jade-100 p-4">Panel 1</div>
    <div className="bg-jade-200 p-4">Panel 2</div>
    <div className="bg-jade-300 p-4">Panel 3</div>
    <div className="bg-jade-400 p-4">Panel 4</div>
  </div>
);
