/**
 * DraggableFieldSection Component
 *
 * A reusable section for displaying drag-and-drop reorderable fields
 * with visibility toggles (Formation and Play Details sections).
 */

import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Typography } from '../../../../design-system/Typography';
import Icon from '../../../../ui/Icon/Icon';
import type { DraggableFieldSectionProps } from '../types';

export const DraggableFieldSection: React.FC<DraggableFieldSectionProps> = ({
  title,
  icon,
  droppableId,
  fieldOrder,
  fields,
  fieldVisibility,
  optimisticPlay,
  handleInlineSave,
  savingFields,
  toggleFieldVisibility,
  onDragEnd,
}) => {
  return (
    <div className="bg-subtle rounded-lg p-3 md:p-sm">
      <Typography
        variant="label-lg"
        as="h4"
        className="text-primary flex items-center mb-sm"
      >
        <Icon name={icon as any} className="h-4 w-4 mr-xs" /> {title}
      </Typography>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId={droppableId}>
          {(provided) => (
            <dl
              className="space-y-xs text-sm"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {fieldOrder.map((fieldKey, index) => {
                const field = fields[fieldKey as keyof typeof fields];
                if (!field) return null;
                const isVisible = fieldVisibility[fieldKey] !== false;

                return (
                  <Draggable
                    key={fieldKey}
                    draggableId={fieldKey}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`p-xs rounded transition-all duration-150 ${
                          snapshot.isDragging
                            ? 'bg-surface-hover shadow-md scale-[1.02]'
                            : 'hover:bg-surface-hover'
                        }`}
                      >
                        <div className="flex items-center gap-xs mb-xs">
                          <div
                            {...provided.dragHandleProps}
                            className="cursor-grab active:cursor-grabbing text-tertiary hover:text-secondary transition-colors"
                          >
                            <Icon name="grip-vertical" className="h-4 w-4" />
                          </div>
                          <dt
                            className={`font-medium text-sm ${
                              isVisible
                                ? 'text-primary'
                                : 'text-tertiary line-through'
                            }`}
                          >
                            {field.label}
                          </dt>
                          <button
                            onClick={() => toggleFieldVisibility(fieldKey)}
                            className="flex-shrink-0 p-xs rounded-lg hover:bg-surface-hover text-tertiary hover:text-secondary transition-colors ml-auto"
                            title={
                              isVisible
                                ? 'Hide from display name'
                                : 'Show in display name'
                            }
                          >
                            <Icon
                              name={isVisible ? 'eye' : 'eye-off'}
                              className="h-4 w-4"
                            />
                          </button>
                        </div>
                        <div className="w-full">
                          {field.render(optimisticPlay, handleInlineSave, savingFields)}
                        </div>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </dl>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};
