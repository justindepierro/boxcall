import React from "react";
import { PenLine } from "lucide-react";

const LucideTest: React.FC = () => (
  <div style={{ padding: 32 }}>
    <h2>Direct Lucide Icon Test</h2>
    <PenLine width={48} height={48} color="#1e293b" strokeWidth={2} />
    <p>
      If you see a pen icon above, Lucide is working. If not, the issue is with
      Lucide or global styles.
    </p>
  </div>
);

export default LucideTest;
