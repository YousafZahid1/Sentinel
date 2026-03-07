import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Mail, User, Lock, ImagePlus } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Auth = () => {
  const navigate = useNavigate();
  const [floorPlanName, setFloorPlanName] = useState<string | null>(null);
  const [floorPlanFile, setFloorPlanFile] = useState<File | null>(null);

  const handleLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigate("/console/ops");
  };

  const handleSignup = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (floorPlanFile && floorPlanFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        const image = typeof reader.result === "string" ? reader.result : undefined;
        try {
          localStorage.setItem(
            "sentinel.floorPlan",
            JSON.stringify({
              name: floorPlanName,
              image,
            }),
          );
        } catch {
          // ignore localStorage errors in demo
        }
        navigate("/console/ops");
      };
      reader.readAsDataURL(floorPlanFile);
    } else {
      try {
        localStorage.setItem(
          "sentinel.floorPlan",
          JSON.stringify({
            name: floorPlanName,
            image: null,
          }),
        );
      } catch {
        // ignore localStorage errors in demo
      }
      navigate("/console/ops");
    }
  };

  return (
    <div className="min-h-screen w-screen bg-background text-foreground flex items-center justify-center mc-scanline">
      <div className="w-full max-w-xl mc-panel border-mc-panel-border shadow-lg">
        <div className="mc-panel-header">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-mc-cyan" />
            <span className="mc-panel-label text-mc-cyan">Sentinel Command</span>
            <span className="font-mono text-[9px] text-muted-foreground px-1.5 py-0.5 bg-mc-panel border border-mc-panel-border">
              ACCESS CONSOLE
            </span>
          </div>
          <span className="font-mono text-[9px] text-muted-foreground">BUILD v2.1.0</span>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="font-mono text-[11px] text-muted-foreground/80 uppercase tracking-[0.25em]">
                Facility Safety System
              </p>
              <p className="font-mono text-sm text-foreground mt-1">
                Authenticate to enter the live incident console.
              </p>
            </div>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="w-full justify-between bg-mc-surface border border-mc-panel-border rounded-none h-9">
              <TabsTrigger
                value="login"
                className="flex-1 rounded-none data-[state=active]:bg-background data-[state=active]:text-mc-cyan"
              >
                <span className="font-mono text-[11px] tracking-[0.18em]">LOGIN</span>
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="flex-1 rounded-none data-[state=active]:bg-background data-[state=active]:text-mc-cyan"
              >
                <span className="font-mono text-[11px] tracking-[0.18em]">SIGN UP</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1">
                  <label className="mc-panel-label text-muted-foreground">Email</label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      type="email"
                      required
                      placeholder="ops@facility.example"
                      className="pl-9 h-9 bg-mc-surface border-mc-panel-border text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="mc-panel-label text-muted-foreground">Password</label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      type="password"
                      required
                      placeholder="••••••••••"
                      className="pl-9 h-9 bg-mc-surface border-mc-panel-border text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground mt-1">
                  <span>Single sign-on stub • Local only</span>
                  <span className="text-mc-cyan">ENCRYPTED LINK</span>
                </div>

                <Button type="submit" className="w-full h-9 mt-2 bg-mc-cyan text-background hover:bg-mc-cyan/90">
                  <span className="font-mono text-[11px] tracking-[0.22em]">ENTER CONSOLE</span>
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-4">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="mc-panel-label text-muted-foreground">Email</label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input
                        type="email"
                        required
                        placeholder="ops@facility.example"
                        className="pl-9 h-9 bg-mc-surface border-mc-panel-border text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="mc-panel-label text-muted-foreground">Username</label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input
                        type="text"
                        required
                        placeholder="COMMAND-01"
                        className="pl-9 h-9 bg-mc-surface border-mc-panel-border text-sm uppercase"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="mc-panel-label text-muted-foreground">Password</label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      type="password"
                      required
                      placeholder="••••••••••"
                      className="pl-9 h-9 bg-mc-surface border-mc-panel-border text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                    <label className="mc-panel-label text-muted-foreground">Facility Floor Plan</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      required
                      onChange={e => {
                        const file = e.target.files?.[0];
                        setFloorPlanName(file ? file.name : null);
                        setFloorPlanFile(file ?? null);
                      }}
                      className="peer absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="flex items-center justify-between h-10 px-3 bg-mc-surface border border-dashed border-mc-panel-border text-xs text-muted-foreground cursor-pointer peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background">
                      <div className="flex items-center gap-2">
                        <ImagePlus className="w-3.5 h-3.5 text-mc-cyan" />
                        <span className="font-mono text-[10px]">
                          {floorPlanName ?? "Attach building floor plan (PNG, JPG, PDF)"}
                        </span>
                      </div>
                      <span className="font-mono text-[9px] text-mc-cyan">
                        BROWSE
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground mt-1">
                  <span>Stored locally for demo • No network calls</span>
                  <span className="text-mc-amber">CONFIGURE CAMERAS AFTER LOGIN</span>
                </div>

                <Button type="submit" className="w-full h-9 mt-2 bg-mc-green text-background hover:bg-mc-green/90">
                  <span className="font-mono text-[11px] tracking-[0.22em]">CREATE FACILITY PROFILE</span>
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Auth;

