"use client";

import { GENRES } from "@/lib/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GenreFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export function GenreFilter({ value, onChange }: GenreFilterProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-40">
        <SelectValue placeholder="All genres" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All genres</SelectItem>
        {GENRES.map((genre) => (
          <SelectItem key={genre} value={genre} className="capitalize">
            {genre}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
