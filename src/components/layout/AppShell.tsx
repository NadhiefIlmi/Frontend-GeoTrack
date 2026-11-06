import type { ReactNode } from "react";
import { Component, type ErrorInfo } from "react";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { SidebarProvider } from "./SidebarContext";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class MainErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[GeoTrack Main CatchBoundary]:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full items-center justify-center p-8 bg-background">
          <div className="max-w-md w-full rounded-2xl border border-border bg-card p-6 shadow-xl text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <AlertTriangle className="size-6" />
            </div>
            <h2 className="font-display text-lg font-bold text-foreground">
              Tampilan Sedang Mengalami Kendala
            </h2>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Komponen halaman mengalami kendala saat memuat data. Silakan muat ulang halaman atau kembali ke Dasbor.
            </p>
            {this.state.error?.message && (
              <p className="mt-3 rounded-lg bg-muted px-3 py-2 font-mono text-[11px] text-destructive truncate text-left">
                {this.state.error.message}
              </p>
            )}
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  this.setState({ hasError: false });
                  window.location.reload();
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors cursor-pointer"
              >
                <RefreshCw className="size-3.5" />
                Muat Ulang Halaman
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AppHeader />
          <main className="relative min-h-0 flex-1">
            <MainErrorBoundary>{children}</MainErrorBoundary>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
