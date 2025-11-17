import React from "react";
import { Control, UseFormWatch } from "react-hook-form";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { NumberInputWithPresets } from "@/components/ui/number-input-with-presets";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { categoryFields, CategoryField } from "@/lib/scope3-categories";
import {
  materialQuantityPresets,
  distancePresets,
  emissionFactorPresets,
  transportWeightPresets,
} from "@/lib/calculator-presets";

interface DynamicFieldsProps {
  categoryId: number;
  control: Control<any>;
  watch: UseFormWatch<any>;
  fieldPrefix: string;
  index: number;
}

export function Scope3DynamicFields({ categoryId, control, watch, fieldPrefix, index }: DynamicFieldsProps) {
  const fields = categoryFields[categoryId] || [];
  
  // Watch values for conditional fields
  const watchedValues = watch(fieldPrefix);
  
  // Helper to check if field should be shown based on conditional logic
  const shouldShowField = (field: CategoryField): boolean => {
    if (!field.conditional) return true;
    
    const conditionalFieldValue = watchedValues?.[field.conditional.field];
    
    // Handle toggle/boolean conditionals
    if (typeof field.conditional.value === 'boolean') {
      return conditionalFieldValue === field.conditional.value;
    }
    
    // Handle string conditionals (including partial matches for grouped fields)
    if (typeof conditionalFieldValue === 'string' && typeof field.conditional.value === 'string') {
      return conditionalFieldValue.includes(field.conditional.value) || 
             field.conditional.value.includes(conditionalFieldValue);
    }
    
    return conditionalFieldValue === field.conditional.value;
  };
  
  // Get appropriate presets based on field
  const getPresets = (field: CategoryField) => {
    if (field.presets) return field.presets;
    
    switch (field.name) {
      case 'quantity':
        return materialQuantityPresets;
      case 'distance':
      case 'transport_distance':
      case 'commute_distance':
        return distancePresets;
      case 'emission_factor':
        return emissionFactorPresets;
      case 'load_weight':
        return transportWeightPresets;
      default:
        return undefined;
    }
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {fields.map((field) => {
        if (!shouldShowField(field)) return null;
        
        const fieldName = `${fieldPrefix}.${field.name}`;
        
        return (
          <FormField
            key={fieldName}
            control={control}
            name={fieldName}
            render={({ field: formField }) => (
              <FormItem className={field.type === 'text' && field.name.includes('description') ? 'md:col-span-2' : ''}>
                <FormLabel className="flex items-center gap-2">
                  {field.label}
                  {field.required && <span className="text-destructive">*</span>}
                  {field.description && <InfoTooltip content={field.description} />}
                </FormLabel>
                <FormControl>
                  {field.type === 'number' ? (
                    getPresets(field) ? (
                      <NumberInputWithPresets
                        value={formField.value || 0}
                        onChange={formField.onChange}
                        presets={getPresets(field)!}
                        unit={field.unit}
                        min={0}
                      />
                    ) : (
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        {...formField}
                        value={formField.value || ''}
                        onChange={(e) => formField.onChange(parseFloat(e.target.value) || 0)}
                      />
                    )
                  ) : field.type === 'select' ? (
                    <Select
                      value={formField.value}
                      onValueChange={formField.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : field.type === 'toggle' ? (
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={formField.value || false}
                        onCheckedChange={formField.onChange}
                      />
                      <span className="text-sm text-muted-foreground">
                        {formField.value ? 'Yes' : 'No'}
                      </span>
                    </div>
                  ) : (
                    <Input
                      type="text"
                      {...formField}
                      value={formField.value || ''}
                    />
                  )}
                </FormControl>
                {field.description && field.type !== 'toggle' && (
                  <FormDescription>{field.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );
      })}
    </div>
  );
}
