import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/shared/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Plus, Trash2, Pencil, X, Check, Loader2, Tag } from "lucide-react";

interface Category {
  id: string;
  name: string;
  color: string | null;
}

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  color: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const PRESET_COLORS = [
  "#6D4C8C",
  "#E8A87C",
  "#85C1E9",
  "#82E0AA",
  "#F8C471",
  "#F1948A",
  "#BB8FCE",
  "#73C6B6",
  "#D7BDE2",
  "#A3E4D7",
];

function CategoryRow({
  category,
  onEdit,
  onDelete,
  isDeleting,
}: {
  category: Category;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:bg-muted/30">
      <span
        className="h-4 w-4 shrink-0 rounded-full border border-border"
        style={{ backgroundColor: category.color || "#6D4C8C" }}
        aria-hidden="true"
      />
      <span className="flex-1 text-sm font-medium text-foreground">
        {category.name}
      </span>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onEdit}
          aria-label={`Edit ${category.name}`}
        >
          <Pencil size={16} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onDelete}
          disabled={isDeleting}
          className="text-muted-foreground hover:text-danger"
          aria-label={`Delete ${category.name}`}
        >
          {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
        </Button>
      </div>
    </div>
  );
}

function CategoryForm({
  initialValues,
  onSave,
  onCancel,
  isSaving,
  submitLabel,
}: {
  initialValues?: FormValues;
  onSave: (values: FormValues) => void;
  onCancel: () => void;
  isSaving: boolean;
  submitLabel: string;
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues || { name: "", color: "" },
  });

  const watchColor = watch("color");

  return (
    <form
      onSubmit={handleSubmit(onSave)}
      noValidate
      className="rounded-xl border border-border bg-card p-4 space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="cat-name">Category name</Label>
        <Input
          id="cat-name"
          placeholder="e.g. Utilities"
          aria-invalid={errors.name ? "true" : undefined}
          aria-describedby={errors.name ? "cat-name-error" : undefined}
          {...register("name")}
        />
        {errors.name && (
          <p id="cat-name-error" className="text-sm text-danger" role="alert">
            {errors.name.message}
          </p>
        )}
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-foreground">
          Color
        </legend>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setValue("color", watchColor === c ? "" : c)}
              className={cn(
                "h-8 w-8 rounded-full border-2 transition-all",
                watchColor === c
                  ? "border-foreground scale-110"
                  : "border-transparent hover:scale-110"
              )}
              style={{ backgroundColor: c }}
              aria-label={`Select color ${c}`}
              aria-pressed={watchColor === c}
            />
          ))}
          <label className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-dashed border-muted-foreground/40 hover:border-muted-foreground transition-colors">
            <input
              type="color"
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              value={watchColor || "#000000"}
              onChange={(e) => setValue("color", e.target.value)}
              aria-label="Custom color"
            />
            <Plus size={14} className="text-muted-foreground" />
          </label>
        </div>
        {watchColor && (
          <input type="hidden" {...register("color")} value={watchColor} />
        )}
      </fieldset>

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSaving}>
          <X size={16} className="mr-1" />
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? (
            <Loader2 size={16} className="mr-1 animate-spin" />
          ) : (
            <Check size={16} className="mr-1" />
          )}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

export default function CategoryManager() {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: categories, isLoading, error } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get<Category[]>("/categories"),
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: (values: FormValues) =>
      api.post<Category>("/categories", values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setShowAddForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: FormValues }) =>
      api.put<Category>(`/categories/${id}`, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreate = async (values: FormValues) => {
    try {
      await createMutation.mutateAsync(values);
    } catch {
      /* error handled by mutation state */
    }
  };

  const handleUpdate = async (values: FormValues) => {
    if (!editingId) return;
    try {
      await updateMutation.mutateAsync({ id: editingId, values });
    } catch {
      /* error handled by mutation state */
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this category? Payables using it will be uncategorized.")) return;
    setDeletingId(id);
    try {
      await deleteMutation.mutateAsync(id);
    } finally {
      setDeletingId(null);
    }
  };

  const mutationError =
    createMutation.error || updateMutation.error || deleteMutation.error;
  const errorMessage =
    mutationError instanceof Error ? mutationError.message : null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Categories
          </h1>
          <p className="text-sm text-muted-foreground">
            Organise your bills with tags and colors
          </p>
        </div>
        {!showAddForm && (
          <Button onClick={() => setShowAddForm(true)}>
            <Plus size={16} className="mr-1" />
            Add
          </Button>
        )}
      </div>

      {errorMessage && (
        <div
          className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger"
          role="alert"
        >
          {errorMessage}
        </div>
      )}

      {showAddForm && (
        <CategoryForm
          onSave={handleCreate}
          onCancel={() => setShowAddForm(false)}
          isSaving={createMutation.isPending}
          submitLabel="Add category"
        />
      )}

      {isLoading ? (
        <div className="space-y-3" aria-label="Loading categories">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-14 w-full animate-pulse motion-reduce:animate-none rounded-xl bg-muted"
              aria-hidden="true"
            />
          ))}
        </div>
      ) : error && !mutationError ? (
        <div
          className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-8 text-center text-sm text-danger"
          role="alert"
        >
          Failed to load categories. Please try again.
        </div>
      ) : categories && categories.length === 0 && !showAddForm ? (
        <div className="rounded-xl border border-dashed border-muted-foreground/30 px-4 py-12 text-center">
          <Tag
            size={40}
            className="mx-auto mb-3 text-muted-foreground/40"
            aria-hidden="true"
          />
          <p className="text-sm font-medium text-muted-foreground">
            No categories yet
          </p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            Add one to start organising your payables
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {categories?.map((cat) =>
            editingId === cat.id ? (
              <CategoryForm
                key={cat.id}
                initialValues={{ name: cat.name, color: cat.color || "" }}
                onSave={handleUpdate}
                onCancel={() => setEditingId(null)}
                isSaving={updateMutation.isPending}
                submitLabel="Save"
              />
            ) : (
              <CategoryRow
                key={cat.id}
                category={cat}
                onEdit={() => setEditingId(cat.id)}
                onDelete={() => handleDelete(cat.id)}
                isDeleting={deletingId === cat.id}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}
