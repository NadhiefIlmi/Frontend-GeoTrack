import { Check, ChevronDown, Globe } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/i18n/language";
import { LANGS, LANG_LABELS } from "@/i18n/translations";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const { lang, setLang, t } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 px-2.5 py-1.5 text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-lg"
        >
          <Globe className="size-4 text-slate-600" />
          <span className="text-xs font-semibold tracking-wide text-slate-800">
            {LANG_LABELS[lang].short}
          </span>
          <ChevronDown className="size-3 text-slate-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44 border-border bg-popover">
        {LANGS.map((option) => (
          <DropdownMenuItem
            key={option}
            onSelect={() => {
              if (option === lang) return;
              setLang(option);
              toast.success(t("toast.language"));
            }}
            className="gap-2 text-[13px] font-medium"
          >
            <span>{LANG_LABELS[option].name}</span>
            <Check
              className={cn("ml-auto size-3.5", option === lang ? "opacity-100" : "opacity-0")}
            />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
