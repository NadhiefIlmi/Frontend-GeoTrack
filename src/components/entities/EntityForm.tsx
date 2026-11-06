import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useLanguage } from "@/i18n/language";
import type { EntityInput } from "@/state/EntityStore";
import type { Entity, EntityStatus, EntityType } from "@/types/entity";
import { ENTITY_STATUSES, ENTITY_TYPES } from "@/types/entity";
import { TYPE_LABELS } from "./labels";
import { TypeIcon } from "./TypeIcon";
import { MapPicker } from "@/components/map/MapPicker";
import { roundCoord } from "@/lib/format";
import { entityFormSchema } from "@/schemas/entitySchema";

interface EntityFormProps {
  open: boolean;
  entity?: Entity | null;
  onSave: (input: EntityInput) => void;
  onClose: () => void;
}

type FormErrors = Partial<Record<keyof EntityInput, string>>;

type TFn = ReturnType<typeof useLanguage>["t"];

function parseCoord(val: unknown): number {
  if (val === undefined || val === null || val === "") return NaN;
  if (typeof val === "number") return val;
  const str = String(val).replace(/,/g, ".").trim();
  return parseFloat(str);
}

function validate(data: Partial<EntityInput>, t: TFn): FormErrors {
  const result = entityFormSchema.safeParse({
    code: data.code,
    name: data.name,
    type: data.type,
    status: data.status,
    description: data.description ?? "",
    latitude: parseCoord(data.latitude),
    longitude: parseCoord(data.longitude),
  });

  if (result.success) return {};

  const errs: FormErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof EntityInput;
    if (field && !errs[field]) {
      const msg = issue.message;
      errs[field] = msg.startsWith("err.") ? t(msg as Parameters<TFn>[0]) : msg;
    }
  }
  return errs;
}

const BLANK: Partial<EntityInput> = {
  code: "",
  name: "",
  type: "iot_device",
  description: "",
  status: "active",
  latitude: -6.2088,
  longitude: 106.8456,
};

export function EntityForm({ open, entity, onSave, onClose }: EntityFormProps) {
  const { t } = useLanguage();
  const [form, setForm] = useState<Partial<EntityInput>>(BLANK);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (entity) {
      setForm({
        code: entity.code,
        name: entity.name,
        type: entity.type,
        description: entity.description,
        status: entity.status,
        latitude: entity.latitude,
        longitude: entity.longitude,
      });
    } else {
      setForm(BLANK);
    }
    setErrors({});
  }, [entity, open]);

  function set<K extends keyof EntityInput>(key: K, value: EntityInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(form, t);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const firstError = Object.values(errs)[0];
      if (firstError) toast.error(firstError);
      return;
    }
    const lat = parseCoord(form.latitude);
    const lng = parseCoord(form.longitude);
    onSave({
      ...form,
      latitude: lat,
      longitude: lng,
    } as EntityInput);
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 border-l border-border bg-card p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle className="font-display text-base font-semibold text-foreground">
            {entity ? t("form.editTitle") : t("form.addTitle")}
          </SheetTitle>
          <p className="text-[12px] text-muted-foreground">{t("form.hint")}</p>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="scroll-thin flex-1 space-y-4 overflow-y-auto p-5">
            {/* Map picker */}
            <div>
              <Label className="mb-1.5 block text-[12px] text-muted-foreground">
                {t("form.pickHint")}
              </Label>
              <div className="h-40 overflow-hidden rounded-md border border-border">
                <MapPicker
                  lat={form.latitude ?? -6.2088}
                  lng={form.longitude ?? 106.8456}
                  onChange={(lat: number, lng: number) => {
                    set("latitude", roundCoord(lat));
                    set("longitude", roundCoord(lng));
                  }}
                />
              </div>
            </div>

            {/* Code + Name */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="code" className="text-[12px]">
                  {t("field.code")} *
                </Label>
                <Input
                  id="code"
                  value={form.code ?? ""}
                  onChange={(e) => set("code", e.target.value)}
                  placeholder="IOT-001"
                  className={`h-8 text-[13px] ${errors.code ? "border-destructive" : ""}`}
                />
                {errors.code && <p className="text-[11px] text-destructive">{errors.code}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-[12px]">
                  {t("field.name")} *
                </Label>
                <Input
                  id="name"
                  value={form.name ?? ""}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Temperature Sensor..."
                  className={`h-8 text-[13px] ${errors.name ? "border-destructive" : ""}`}
                />
                {errors.name && <p className="text-[11px] text-destructive">{errors.name}</p>}
              </div>
            </div>

            {/* Type + Status */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[12px]">{t("field.type")} *</Label>
                <Select value={form.type} onValueChange={(v) => set("type", v as EntityType)}>
                  <SelectTrigger className="h-8 text-[13px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-popover z-[2500]">
                    {ENTITY_TYPES.map((tp) => (
                      <SelectItem key={tp} value={tp} className="text-[13px]">
                        <div className="flex items-center gap-2">
                          <TypeIcon type={tp} className="size-3.5 text-muted-foreground" />
                          <span>{t(TYPE_LABELS[tp])}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px]">{t("field.status")} *</Label>
                <Select value={form.status} onValueChange={(v) => set("status", v as EntityStatus)}>
                  <SelectTrigger className="h-8 text-[13px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-popover z-[2500]">
                    {ENTITY_STATUSES.map((s) => (
                      <SelectItem key={s} value={s} className="text-[13px]">
                        {t(`status.${s}` as Parameters<TFn>[0])}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Lat + Lng */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="lat" className="text-[12px]">
                  {t("col.latitude")} *
                </Label>
                <Input
                  id="lat"
                  type="text"
                  inputMode="decimal"
                  value={form.latitude ?? ""}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const normalized = raw.replace(/,/g, ".");
                    set("latitude", (raw === "" ? "" : normalized) as unknown as number);
                  }}
                  placeholder="-6.2088"
                  className={`h-8 text-[13px] ${errors.latitude ? "border-destructive" : ""}`}
                />
                {errors.latitude && (
                  <p className="text-[11px] text-destructive">{errors.latitude}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lng" className="text-[12px]">
                  {t("col.longitude")} *
                </Label>
                <Input
                  id="lng"
                  type="text"
                  inputMode="decimal"
                  value={form.longitude ?? ""}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const normalized = raw.replace(/,/g, ".");
                    set("longitude", (raw === "" ? "" : normalized) as unknown as number);
                  }}
                  placeholder="106.8456"
                  className={`h-8 text-[13px] ${errors.longitude ? "border-destructive" : ""}`}
                />
                {errors.longitude && (
                  <p className="text-[11px] text-destructive">{errors.longitude}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="desc" className="text-[12px]">
                {t("field.description")}
              </Label>
              <Textarea
                id="desc"
                value={form.description ?? ""}
                onChange={(e) => set("description", e.target.value)}
                placeholder={t("form.descriptionPlaceholder")}
                rows={3}
                className="resize-none text-[13px]"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex shrink-0 gap-2 border-t border-border bg-card p-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-border bg-transparent text-foreground hover:bg-accent/60"
              onClick={onClose}
            >
              {t("form.cancel")}
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {t("form.saveEntity")}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
