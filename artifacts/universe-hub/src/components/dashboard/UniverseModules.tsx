import { MODULES, type ModuleConfig } from "@/config/modules";
import { ExternalLink, Play, Lock, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

function getButtonIcon(module: ModuleConfig) {
  switch (module.type) {
    case "disabled":
      return <Lock className="w-4 h-4" />;
    case "coming-soon":
      return <Clock className="w-4 h-4" />;
    case "external":
      return <ExternalLink className="w-4 h-4" />;
    case "internal":
      return <Play className="w-4 h-4 fill-current" />;
  }
}

export function UniverseModules() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleAction = (module: ModuleConfig) => {
    switch (module.type) {
      case "disabled":
        return;

      case "coming-soon":
        toast({
          title: "Module ngoại tuyến",
          description: `${module.title} hiện đang trong quá trình xây dựng.`,
          className: "bg-black border border-primary text-primary font-mono",
        });
        return;

      case "external":
        if (module.url) {
          window.open(module.url, "_blank", "noopener,noreferrer");
        }
        return;

      case "internal":
        if (module.url) {
          setLocation(module.url);
        }
        return;
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white uppercase tracking-wider flex items-center gap-3">
        <span className="w-2 h-6 bg-primary rounded-sm shadow-[0_0_10px_hsl(var(--primary))]"></span>
        Mô-đun Vũ trụ
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MODULES.map((module, i) => {
          const isDisabled = module.type === "disabled";

          return (
            <div
              key={module.id}
              data-testid={`card-module-${module.id}`}
              className={cn(
                "glass-panel p-6 rounded-xl border flex flex-col relative overflow-hidden group transition-all duration-500",
                module.theme.borderColor,
                module.theme.hoverBorder,
                isDisabled
                  ? "opacity-60 grayscale hover:grayscale-0"
                  : "hover:-translate-y-1 hover:shadow-2xl"
              )}
              style={{
                animationFillMode: "both",
                animation: `fadeInUp 0.5s ease-out ${i * 0.1}s forwards`,
              }}
            >
              <div
                className={cn(
                  "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none",
                  module.theme.accent
                )}
              ></div>

              <div className="relative z-10 flex-1">
                <h3
                  className={cn(
                    "text-xl font-bold uppercase tracking-wider mb-2 transition-colors",
                    module.theme.textColor
                  )}
                >
                  {module.title}
                </h3>
                <p className="text-sm text-muted-foreground/80 mb-6 min-h-[40px]">
                  {module.description}
                </p>
              </div>

              <button
                onClick={() => handleAction(module)}
                disabled={isDisabled}
                data-testid={`button-module-${module.id}`}
                className={cn(
                  "relative w-full py-3 px-4 rounded-lg font-bold text-sm tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 border",
                  isDisabled
                    ? "bg-white/5 border-white/10 text-white/40 cursor-not-allowed"
                    : cn(
                        "bg-black/50",
                        module.theme.borderColor,
                        module.theme.textColor,
                        "hover:bg-black/80"
                      )
                )}
              >
                {getButtonIcon(module)}
                {module.buttonText}
              </button>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
