import { format, formatDistanceToNowStrict } from "date-fns";
import { enUS, id as idLocale } from "date-fns/locale";
import type { Lang } from "@/i18n/translations";

const locales = { en: enUS, id: idLocale } as const;

export function relativeTime(iso: string, lang: Lang): string {
  return formatDistanceToNowStrict(new Date(iso), { addSuffix: true, locale: locales[lang] });
}

export function formatDateTime(iso: string, lang: Lang): string {
  return format(new Date(iso), "dd MMM yyyy, HH:mm", { locale: locales[lang] });
}

export function formatCoord(value: number): string {
  return value.toFixed(5);
}
