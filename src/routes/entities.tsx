import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EntityTable } from "@/components/entities/EntityTable";
import { EntityDetailPanel } from "@/components/entities/EntityDetailPanel";
import { EntityForm } from "@/components/entities/EntityForm";
import { DeleteConfirmDialog } from "@/components/entities/DeleteConfirmDialog";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { useEntityStore } from "@/state/EntityStore";
import { useLanguage } from "@/i18n/language";
import type { Entity } from "@/types/entity";
import type { EntityInput } from "@/state/EntityStore";

export const Route = createFileRoute("/entities")({
  component: EntityManagementPage,
});

function EntityManagementPage() {
  const { t } = useLanguage();
  const { entities, addEntity, updateEntity, deleteEntity, isLoading } = useEntityStore();
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [editEntity, setEditEntity] = useState<Entity | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Entity | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  function handleAdd() {
    setEditEntity(null);
    setFormOpen(true);
  }

  function handleEdit(entity: Entity) {
    setEditEntity(entity);
    setSelectedEntity(null);
    setFormOpen(true);
  }

  function handleSave(input: EntityInput) {
    if (editEntity) {
      const updated = updateEntity(editEntity.id, input);
      toast.success(t("toast.updated"));
      if (updated) setSelectedEntity(updated);
    } else {
      addEntity(input);
      toast.success(t("toast.created"));
    }
    setFormOpen(false);
    setEditEntity(null);
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    deleteEntity(deleteTarget.id);
    if (selectedEntity?.id === deleteTarget.id) setSelectedEntity(null);
    toast.success(t("toast.deleted"));
    setDeleteTarget(null);
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Main content */}
      <div className="scroll-thin flex min-w-0 flex-1 flex-col overflow-y-auto p-6">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">
              {t("entities.pageTitle")}
            </h1>
            <p className="mt-0.5 text-[13px] text-muted-foreground">{t("entities.pageDesc")}</p>
          </div>
          <Button
            onClick={handleAdd}
            className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
            size="sm"
          >
            <Plus className="size-4" />
            {t("entities.add")}
          </Button>
        </div>

        {/* Stats */}
        <div className="mb-6">
          <DashboardStats />
        </div>

        {/* Table */}
        <EntityTable
          entities={entities}
          showCoords
          onView={setSelectedEntity}
          onEdit={handleEdit}
          onDelete={setDeleteTarget}
          isLoading={isLoading}
        />
      </div>

      {/* Detail panel */}
      {selectedEntity && !formOpen && (
        <EntityDetailPanel
          entity={selectedEntity}
          onClose={() => setSelectedEntity(null)}
          onEdit={handleEdit}
          onDelete={setDeleteTarget}
        />
      )}

      {/* Form */}
      <EntityForm
        open={formOpen}
        entity={editEntity}
        onSave={handleSave}
        onClose={() => {
          if (editEntity) setSelectedEntity(editEntity);
          setFormOpen(false);
          setEditEntity(null);
        }}
      />

      {/* Delete */}
      <DeleteConfirmDialog
        open={!!deleteTarget}
        entityName={deleteTarget?.name ?? ""}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
