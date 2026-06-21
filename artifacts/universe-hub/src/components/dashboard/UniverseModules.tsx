import { universeModules } from "@/data/mockData";
import { ExternalLink, Play, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function UniverseModules() {
  const { toast } = useToast();

  const handleAction = (module: typeof universeModules[0]) => {
    if (module.isDisabled) return;
    
    if (module.isComingSoon) {
      toast({
        title: "Module Offline",
        description: `${module.title} is currently under construction.`,
        className: "bg-black border border-primary text-primary font-mono",
      });
      return;
    }

    if (module.externalUrl) {
      window.open(module.externalUrl, '_blank');
      return;
    }

    // In-app navigation (mocked with toast for now since we only have dashboard)
    toast({
      title: "Initializing Sequence",
      description: `Entering ${module.title}...`,
      className: "bg-black border border-primary text-primary font-mono",
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white uppercase tracking-wider flex items-center gap-3">
        <span className="w-2 h-6 bg-primary rounded-sm shadow-[0_0_10px_hsl(var(--primary))]"></span>
        Universe Modules
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {universeModules.map((module, i) => (
          <div 
            key={module.id}
            className={cn(
              "glass-panel p-6 rounded-xl border flex flex-col relative overflow-hidden group transition-all duration-500",
              module.borderColor,
              module.hoverBorder,
              module.isDisabled ? "opacity-60 grayscale hover:grayscale-0" : "hover:-translate-y-1 hover:shadow-2xl"
            )}
            style={{ 
              animationFillMode: 'both',
              animation: `fadeInUp 0.5s ease-out ${i * 0.1}s forwards`
            }}
          >
            {/* Background glow effect on hover */}
            <div className={cn(
              "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none",
              module.accent
            )}></div>

            <div className="relative z-10 flex-1">
              <h3 className={cn(
                "text-xl font-bold uppercase tracking-wider mb-2 transition-colors",
                module.textColor
              )}>
                {module.title}
              </h3>
              <p className="text-sm text-muted-foreground/80 mb-6 min-h-[40px]">
                {module.description}
              </p>
            </div>

            <button
              onClick={() => handleAction(module)}
              disabled={module.isDisabled}
              className={cn(
                "relative w-full py-3 px-4 rounded-lg font-bold text-sm tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 border",
                module.isDisabled 
                  ? "bg-white/5 border-white/10 text-white/40 cursor-not-allowed"
                  : `bg-black/50 ${module.borderColor} ${module.textColor} hover:bg-black/80 hover:${module.glowColor} hover:shadow-[0_0_15px_currentColor]`
              )}
            >
              {module.isDisabled ? (
                <Lock className="w-4 h-4" />
              ) : module.externalUrl ? (
                <ExternalLink className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4 fill-current" />
              )}
              {module.buttonText}
            </button>
          </div>
        ))}
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
