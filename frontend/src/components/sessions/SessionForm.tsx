"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import type { Session } from "@/types";

const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.string().refine((v) => parseFloat(v) >= 0, "Price cannot be negative"),
  duration: z.string().refine((v) => parseInt(v) >= 1, "Duration must be at least 1 minute"),
  image: z.any().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  session?: Session;
  onSubmit: (data: FormData) => Promise<void>;
  loading?: boolean;
}

export default function SessionForm({ session, onSubmit, loading }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: session
      ? {
          title: session.title,
          description: session.description,
          price: session.price,
          duration: String(session.duration),
        }
      : {},
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input
        label="Title"
        placeholder="e.g. Advanced React Patterns"
        error={errors.title?.message}
        {...register("title")}
      />
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Description</label>
        <textarea
          rows={4}
          placeholder="What will participants learn?"
          className={`rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100
            ${errors.description ? "border-red-400" : "border-gray-300"}`}
          {...register("description")}
        />
        {errors.description && (
          <p className="text-xs text-red-500">{errors.description.message}</p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Price ($)"
          type="number"
          step="0.01"
          min="0"
          placeholder="49.99"
          error={errors.price?.message}
          {...register("price")}
        />
        <Input
          label="Duration (minutes)"
          type="number"
          min="1"
          placeholder="60"
          error={errors.duration?.message}
          {...register("duration")}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Cover Image</label>
        <input
          type="file"
          accept="image/*"
          className="text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-blue-600 hover:file:bg-blue-100"
          {...register("image")}
        />
      </div>
      <Button type="submit" loading={loading} className="mt-2">
        {session ? "Update Session" : "Create Session"}
      </Button>
    </form>
  );
}
