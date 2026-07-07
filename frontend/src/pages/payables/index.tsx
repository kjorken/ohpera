import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/lib/api";
import { useRequireAuth } from "@/shared/hooks/useRequireAuth";
import AppShell from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PayableCard from "@/features/payables/components/PayableCard";
import { Plus, ListTodo, Archive, CircleAlert } from "lucide-react";
import Link from "next/link";
import type { PayableWithPeriods, TabType } from "@/features/payables/components/payable.types";

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse motion-reduce:animate-none rounded-md bg-muted ${className ?? ""}`}
      aria-hidden="true"
    />
  );
}

const tabs: { key: TabType; label: string; icon: typeof ListTodo }[] = [
  { key: "current", label: "Current", icon: ListTodo },
  { key: "archived", label: "Archive", icon: Archive },
];

export default function PayablesPage() {
  const { isAuthed, isHydrated } = useRequireAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>("current");

  const { data: activePayables, isLoading: loadingActive } = useQuery({
    queryKey: ["payables"],
    queryFn: () => api.get<PayableWithPeriods[]>("/payables"),
    enabled: isAuthed,
    retry: false,
  });

  const { data: archivedPayables, isLoading: loadingArchived } = useQuery({
    queryKey: ["payables", "archived"],
    queryFn: () => api.get<PayableWithPeriods[]>("/payables?archived=true"),
    enabled: isAuthed,
    retry: false,
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => api.put(`/payables/${id}/archive`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payables"] });
      queryClient.invalidateQueries({ queryKey: ["payables", "archived"] });
    },
  });

  const unarchiveMutation = useMutation({
    mutationFn: (id: string) => api.put(`/payables/${id}`, { isArchived: false }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payables"] });
      queryClient.invalidateQueries({ queryKey: ["payables", "archived"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/payables/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payables"] });
      queryClient.invalidateQueries({ queryKey: ["payables", "archived"] });
    },
  });

  const handleArchive = (id: string) => {
    archiveMutation.mutate(id);
  };

  const handleUnarchive = (id: string) => {
    unarchiveMutation.mutate(id);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this bill? This can't be undone.")) {
      deleteMutation.mutate(id);
    }
  };

  if (!isHydrated) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-6 h-8 w-24 animate-pulse motion-reduce:animate-none rounded-md bg-muted" aria-hidden="true" />
        <div className="space-y-3">
          <div className="h-36 w-full animate-pulse motion-reduce:animate-none rounded-xl bg-muted" aria-hidden="true" />
          <div className="h-36 w-full animate-pulse motion-reduce:animate-none rounded-xl bg-muted" aria-hidden="true" />
        </div>
      </div>
    );
  }

  if (!isAuthed) return null;

  const isLoading =
    activeTab === "current" ? loadingActive : loadingArchived;
  const payables =
    activeTab === "current" ? activePayables : archivedPayables;

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-6 md:px-6 md:py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Bills</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {activeTab === "current"
                ? (activePayables?.length
                    ? `${activePayables.length} active bill${activePayables.length !== 1 ? "s" : ""}`
                    : "Track your bills and stay on top of due dates")
                : (archivedPayables?.length
                    ? `${archivedPayables.length} archived bill${archivedPayables.length !== 1 ? "s" : ""}`
                    : "Bills you've marked as done")
              }
            </p>
          </div>
          {activeTab === "current" && (
            <Link href="/payables/new">
              <Button className="h-11 shadow-md shadow-ube/15 hover:shadow-lg hover:shadow-ube/25 transition-shadow md:h-12 md:px-6 md:text-base">
                <Plus size={18} className="mr-1.5" aria-hidden="true" />
                Add a bill
              </Button>
            </Link>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 border-b border-border" role="tablist">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${
                  isActive
                    ? "border-ube text-ube"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon size={16} aria-hidden="true" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-3" aria-label="Loading bills">
            <Skeleton className="h-36" />
            <Skeleton className="h-36" />
          </div>
        )}

        {/* Empty */}
        {!isLoading && payables?.length === 0 && (
          <Card className="border-dashed border-muted-foreground/30">
            <CardHeader className="items-center pb-2 pt-8 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-ube/10">
                <CircleAlert className="text-ube" size={24} aria-hidden="true" />
              </div>
              <CardTitle className="font-display text-xl text-foreground">
                {activeTab === "current" ? "No active bills" : "No archived bills"}
              </CardTitle>
              <CardDescription className="mx-auto max-w-xs">
                {activeTab === "current"
                  ? "Add your first bill to start tracking."
                  : "Archived bills will appear here once you mark them as done."
                }
              </CardDescription>
            </CardHeader>
            {activeTab === "current" && (
              <CardContent className="flex justify-center pb-8">
                <Link href="/payables/new">
                  <Button>
                    <Plus size={18} className="mr-1.5" aria-hidden="true" />
                    Add a bill
                  </Button>
                </Link>
              </CardContent>
            )}
          </Card>
        )}

        {/* List */}
        {!isLoading && payables && payables.length > 0 && (
          <div className="space-y-3" role="list">
            {payables.map((payable) => (
              <div key={payable.id} role="listitem">
                <PayableCard
                  payable={payable}
                  isArchived={activeTab === "archived"}
                  onArchive={handleArchive}
                  onDelete={handleDelete}
                  onUnarchive={handleUnarchive}
                />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!isLoading && payables === undefined && (
          <Card className="border-danger/30">
            <CardHeader className="items-center pt-8 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-danger/10">
                <CircleAlert className="text-danger" size={24} aria-hidden="true" />
              </div>
              <CardTitle className="text-xl text-foreground">Couldn&apos;t load bills</CardTitle>
              <CardDescription className="mx-auto max-w-xs">
                Something went wrong. Try refreshing the page.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
