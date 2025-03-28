// src/components/presets/PresetSelector.tsx
'use client';

import React from 'react';
import { PresetOption } from '@/config/presetOptions'; // Adjust path if needed
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card'; // Use Card for option styling

interface PresetSelectorProps {
  title: string;
  options: PresetOption[];
  selectedValue: string; // ID of the selected option ('adventure', 'custom', etc.)
  onValueChange: (value: string) => void; // Called when a preset is selected
  customValue: string; // Current text in the custom input/textarea
  onCustomValueChange: (value: string) => void; // Called when custom input changes
  customPlaceholder?: string;
  isTextArea?: boolean; // Use Textarea for custom input if true, otherwise Input
}

const PresetSelector: React.FC<PresetSelectorProps> = ({
  title,
  options,
  selectedValue,
  onValueChange,
  customValue,
  onCustomValueChange,
  customPlaceholder = 'Describe your custom option...',
  isTextArea = true,
}) => {
  const showCustomInput = selectedValue === 'custom';

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>

      <RadioGroup
        value={selectedValue}
        onValueChange={onValueChange} // Directly use the prop for RadioGroup changes
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
      >
        {options.map((option) => {
          const isSelected = selectedValue === option.id;
          return (
            <Label
              key={option.id}
              htmlFor={`option-${option.id}`}
              className={cn(
                'cursor-pointer rounded-lg border-2 p-4 transition-all',
                'hover:border-primary/50', // General hover effect
                isSelected
                  ? `${option.colorClass.replace('bg-', 'bg-opacity-20 ').replace('border-', 'border-opacity-100 ')} border-primary` // Enhanced selected style
                  : `${option.colorClass} border-border` // Default style
              )}
              style={{
                // Optional: Add a subtle gradient or effect for selection
                boxShadow: isSelected ? `0 0 0 2px hsl(var(--primary) / 0.5)` : 'none',
              }}
            >
              <Card className="bg-transparent border-none shadow-none p-0 flex items-start gap-3">
                <RadioGroupItem
                  value={option.id}
                  id={`option-${option.id}`}
                  className={cn(
                    "mt-1 border-foreground/50 data-[state=checked]:border-primary data-[state=checked]:text-primary",
                     // Make radio button color match the theme
                    isSelected ? option.colorClass.replace(/border-|bg-|text-/g, 'border-') : ''
                  )}
                 />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 font-medium">
                    <option.icon className={cn("h-5 w-5", isSelected ? 'text-primary' : option.colorClass.replace(/border-|bg-/g, ''))} />
                    <span>{option.label}</span>
                  </div>
                  <p className={cn("text-sm", isSelected ? 'text-foreground/90' : 'text-muted-foreground')}>
                    {option.description}
                  </p>
                </div>
              </Card>
            </Label>
          );
        })}
      </RadioGroup>

      {/* Custom Input Section */}
      {showCustomInput && (
        <div className="mt-4 space-y-2">
          <Label htmlFor={`custom-${title.replace(/\s+/g, '-')}`} className="font-medium">
            Describe your custom {title.split(' ')[1]?.toLowerCase() || 'option'}:
          </Label>
          {isTextArea ? (
            <Textarea
              id={`custom-${title.replace(/\s+/g, '-')}`}
              value={customValue}
              onChange={(e) => onCustomValueChange(e.target.value)}
              placeholder={customPlaceholder}
              className="min-h-[80px]"
              rows={3}
            />
          ) : (
            <Input
              id={`custom-${title.replace(/\s+/g, '-')}`}
              value={customValue}
              onChange={(e) => onCustomValueChange(e.target.value)}
              placeholder={customPlaceholder}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default PresetSelector;