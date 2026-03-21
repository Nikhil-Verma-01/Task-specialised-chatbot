"use client";

import { Button } from "@/components/ui/button";

type SuggestionChipsProps = {
  items: string[];
  disabled?: boolean;
  onSelect: (value: string) => Promise<void>;
};

export function SuggestionChips({
  items,
  disabled = false,
  onSelect,
}: SuggestionChipsProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-slate-500">Quick prompts</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Button
            key={item}
            type="button"
            variant="secondary"
            size="sm"
            disabled={disabled}
            onClick={() => void onSelect(item)}
          >
            {item}
          </Button>
        ))}
      </div>
    </div>
  );
}
