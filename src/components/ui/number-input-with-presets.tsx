import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

export interface PresetOption {
  value: number;
  label: string;
  description?: string;
}

interface NumberInputWithPresetsProps {
  value: number;
  onChange: (value: number) => void;
  presets: PresetOption[];
  placeholder?: string;
  unit?: string;
  min?: number;
  disabled?: boolean;
}

export function NumberInputWithPresets({
  value,
  onChange,
  presets,
  placeholder = "Select or enter value",
  unit = "",
  min = 0,
  disabled = false,
}: NumberInputWithPresetsProps) {
  const [open, setOpen] = React.useState(false);
  const [customMode, setCustomMode] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(value?.toString() || "");

  // Check if current value matches a preset
  const selectedPreset = presets.find(preset => preset.value === value);

  React.useEffect(() => {
    setInputValue(value?.toString() || "");
  }, [value]);

  const handlePresetSelect = (presetValue: number) => {
    onChange(presetValue);
    setCustomMode(false);
    setOpen(false);
  };

  const handleCustomInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    const numVal = parseFloat(val);
    if (!isNaN(numVal) && numVal >= min) {
      onChange(numVal);
    }
  };

  const handleCustomMode = () => {
    setCustomMode(true);
    setOpen(false);
  };

  if (customMode) {
    return (
      <div className="flex gap-2">
        <Input
          type="number"
          value={inputValue}
          onChange={handleCustomInput}
          placeholder={placeholder}
          min={min}
          step="any"
          disabled={disabled}
          className="flex-1 h-10 text-sm"
        />
        {unit && <span className="flex items-center text-sm text-muted-foreground px-2">{unit}</span>}
        <Button
          type="button"
          variant="outline"
          size="default"
          onClick={() => setCustomMode(false)}
          disabled={disabled}
          className="touch-target whitespace-nowrap"
        >
          Presets
        </Button>
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-10 touch-target text-sm"
          disabled={disabled}
        >
          <span className="truncate">
            {selectedPreset ? (
              <>
                {selectedPreset.label}
                {unit && <span className="text-muted-foreground ml-1">({unit})</span>}
              </>
            ) : value ? (
              <>
                {value}
                {unit && <span className="text-muted-foreground ml-1">{unit}</span>}
              </>
            ) : (
              placeholder
            )}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[calc(100vw-2rem)] sm:w-[400px] p-0 bg-popover" 
        align="start"
      >
        <Command className="bg-popover">
          <CommandInput placeholder="Search presets..." className="h-12" />
          <CommandList className="max-h-[300px]">
            <CommandEmpty>No preset found.</CommandEmpty>
            <CommandGroup heading="Common Values">
              {presets.map((preset) => (
                <CommandItem
                  key={preset.value}
                  value={preset.label}
                  onSelect={() => handlePresetSelect(preset.value)}
                  className="py-3 cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 shrink-0",
                      value === preset.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-medium text-sm">{preset.label}</span>
                    {preset.description && (
                      <span className="text-xs text-muted-foreground truncate">{preset.description}</span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup>
              <CommandItem onSelect={handleCustomMode} className="py-3 cursor-pointer">
                <span className="text-primary font-medium text-sm">Enter Custom Value...</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
