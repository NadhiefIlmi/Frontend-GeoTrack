import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { LazyEntityMap } from "@/components/map/LazyEntityMap";
import { FloatingEntityPanel } from "@/components/dashboard/FloatingEntityPanel";
import { EntityDetailPanel } from "@/components/entities/EntityDetailPanel";
import { EntityForm } from "@/components/entities/EntityForm";
import { DeleteConfirmDialog } from "@/components/entities/DeleteConfirmDialog";
import { useEntityStore } from "@/state/EntityStore";
import { useLanguage } from "@/i18n/language";
import type { Entity } from "@/types/entity";
import type { EntityInput } from "@/state/EntityStore";

export const Route = createFileRoute("/")({
  component: DashboardPage,
});

function DashboardPage() {
  const { t } = useLanguage();
  const { entities, addEntity, updateEntity, deleteEntity, isLoading } = useEntityStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editEntity, setEditEntity] = useState<Entity | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Entity | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const selectedEntity = selectedId ? (entities.find((e) => e.id === selectedId) ?? null) : null;

  function handleSelectEntity(id: string) {
    setSelectedId((prev) => (prev === id ? null : id));
  }

  function handleEdit(entity: Entity) {
    setSelectedId(null);
    setEditEntity(entity);
    setFormOpen(true);
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    deleteEntity(deleteTarget.id);
    if (selectedId === deleteTarget.id) setSelectedId(null);
    toast.success(t("toast.deleted"));
    setDeleteTarget(null);
  }

  function handleSave(input: EntityInput) {
    if (editEntity) {
      const id = editEntity.id;
      updateEntity(id, input);
      toast.success(t("toast.updated"));
      setFormOpen(false);
      setEditEntity(null);
      setSelectedId(id);
    } else {
      const created = addEntity(input);
      toast.success(t("toast.created"));
      setFormOpen(false);
      setEditEntity(null);
      setSelectedId(created.id);
    }
  }

  return (
    <div className="relative flex h-full w-full overflow-hidden">
      {/* Full-screen map */}
      <LazyEntityMap
        entities={entities}
        selectedId={selectedId}
        onSelect={handleSelectEntity}
        detailOpen={!!selectedEntity && !formOpen}
        isLoading={isLoading}
        focus={
          selectedEntity
            ? { lat: selectedEntity.latitude, lng: selectedEntity.longitude, id: selectedEntity.id }
            : null
        }
        className="h-full flex-1"
      />

      {/* Floating panel */}
      <FloatingEntityPanel
        onSelectEntity={handleSelectEntity}
        selectedId={selectedId}
        detailOpen={!!selectedEntity && !formOpen}
        hidden={formOpen}
      />

      {/* Detail panel — slides in from right */}
      {selectedEntity && !formOpen && (
        <div className="absolute right-0 top-0 z-[1100] h-full shadow-2xl animate-in slide-in-from-right duration-300">
          <EntityDetailPanel
            entity={selectedEntity}
            onClose={() => setSelectedId(null)}
            onEdit={handleEdit}
            onDelete={setDeleteTarget}
          />
        </div>
      )}

      {/* Edit form */}
      <EntityForm
        open={formOpen}
        entity={editEntity}
        onSave={handleSave}
        onClose={() => {
          if (editEntity) setSelectedId(editEntity.id);
          setFormOpen(false);
          setEditEntity(null);
        }}
      />

      {/* Delete dialog */}
      <DeleteConfirmDialog
        open={!!deleteTarget}
        entityName={deleteTarget?.name ?? ""}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
