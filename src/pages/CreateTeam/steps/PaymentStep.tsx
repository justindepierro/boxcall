import React from "react";
import type { TeamFormData } from "../types";
import { Button } from "../../../components/ui/Button/Button";

interface PaymentStepProps {
  formData: TeamFormData;
  updateField: (field: keyof TeamFormData, value: string) => void;
  next: () => void;
  prev: () => void;
}

export const PaymentStep: React.FC<PaymentStepProps> = ({
  formData,
  updateField,
  next,
  prev,
}) => {
  return (
    <div>
      <h2>Payment & Subscription</h2>
      <select
        value={formData.subscriptionTier}
        onChange={(e) => updateField("subscriptionTier", e.target.value)}
      >
        <option value="team-basic">Team Basic</option>
        <option value="team-premium">Team Premium</option>
        {/* Add more tiers as needed */}
      </select>
      <input
        type="text"
        value={formData.paymentMethod}
        onChange={(e) => updateField("paymentMethod", e.target.value)}
        placeholder="Payment Method (e.g., Credit Card)"
      />
      <Button onClick={prev}>Back</Button>
      <Button onClick={next}>Next</Button>
    </div>
  );
};
