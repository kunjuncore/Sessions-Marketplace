"use client";

import { useForm } from "react-hook-form";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import type { SessionFilters } from "@/types";

interface Props {
  filters: SessionFilters;
  onChange: (f: SessionFilters) => void;
}

export default function SessionFiltersPanel({ filters, onChange }: Props) {
  const { register, handleSubmit, reset } = useForm<SessionFilters>({
    defaultValues: filters,
  });

  const onSubmit = (data: SessionFilters) => onChange({ ...data, page: 1 });
  const onClear = () => {
    reset({});
    onChange({ page: 1 });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
    >
      <h3 className="mb-4 font-semibold text-gray-800">Filters</h3>

      <div className="flex flex-col gap-3">
        <Input label="Search" placeholder="Title, creator…" {...register("search")} />

        <div className="grid grid-cols-2 gap-2">
          <Input label="Min price ($)" type="number" placeholder="0" {...register("min_price")} />
          <Input label="Max price ($)" type="number" placeholder="999" {...register("max_price")} />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Input label="Min duration (min)" type="number" placeholder="0" {...register("min_duration")} />
          <Input label="Max duration (min)" type="number" placeholder="240" {...register("max_duration")} />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Sort by</label>
          <select
            {...register("ordering")}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="-created_at">Newest</option>
            <option value="created_at">Oldest</option>
            <option value="price">Price: Low → High</option>
            <option value="-price">Price: High → Low</option>
            <option value="duration">Duration: Short → Long</option>
            <option value="-duration">Duration: Long → Short</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Button type="submit" className="flex-1">Apply</Button>
        <Button type="button" variant="secondary" onClick={onClear}>Clear</Button>
      </div>
    </form>
  );
}
