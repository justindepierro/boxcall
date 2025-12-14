/**
 * MethodStep Component
 *
 * Initial step for selecting how to join a team
 */

import React from "react";
import { Typography } from "../../components/design-system";
import { Icon } from "../../components/ui/Icon/Icon";
import { Button } from "../../components/ui/Button/Button";
import type { MethodStepProps } from "./types";

export const MethodStep: React.FC<MethodStepProps> = ({
  joinMethods,
  onMethodSelect,
}) => {
  return (
    <div>
      <div className="text-center mb-8">
        <Icon
          name="phone"
          size="xl"
          color="primary"
          className="mx-auto mb-4"
        />
        <Typography variant="headline-xl" className="mb-4">
          Join a Team
        </Typography>
        <Typography
          variant="body-lg"
          color="muted"
          className="container-content"
        >
          Choose how you'd like to join your team. Most coaches will provide you
          with an invite code, but you can also search for your team directly.
        </Typography>
      </div>

      <div className="grid-form">
        {joinMethods.map((method) => (
          <Button
            key={method.id}
            type="button"
            variant={method.primary ? "primary" : "outline"}
            onClick={() => onMethodSelect(method.id)}
            className={
              method.primary
                ? "p-6 h-auto w-full justify-start text-left rounded-lg"
                : "p-6 h-auto w-full justify-start text-left rounded-lg border-muted dark:border-text-tertiary bg-primary"
            }
          >
            <div className="flex items-start gap-4">
              <Icon
                name={method.icon as "key" | "mail" | "search" | "user-plus"}
                size="lg"
                color={method.primary ? "primary" : "secondary"}
              />
              <div>
                <Typography variant="headline-sm" className="mb-2">
                  {method.title}
                  {method.primary && (
                    <span className="ml-2 bg-accent0 text-primary text-xs px-2 py-1 rounded-full">
                      Most Common
                    </span>
                  )}
                </Typography>
                <Typography variant="body-sm" color="muted">
                  {method.description}
                </Typography>
              </div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};

MethodStep.displayName = "MethodStep";
