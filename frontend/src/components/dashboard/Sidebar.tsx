import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Camera,
  Bell,
  Shield,
  Users,
  Settings,
  Activity,
  MapPin,
  ChevronLeft,
} from "lucide-react";

interface SidebarProps {
  activeItem: string;
  onNavigate: (item: string) => void;
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "cameras", label: "Cameras", icon: Camera },
  { id: "alerts", label: "Alerts", icon: Bell, badge: 3 },
  { id: "incidents", label: "Incidents", icon: Shield },
  { id: "analytics", label: "Analytics", icon: Activity },
  { id: "map", label: "Site Map", icon: MapPin },
  { id: "responders", label: "Responders", icon: Users },
];

const Sidebar = ({ activeItem, onNavigate, collapsed, onToggle }: SidebarProps) => {
  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className="h-screen bg-sidebar border-r border-sidebar-border flex flex-col fixed left-0 top-0 z-30"
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sentinel-blue to-sentinel-cyan flex items-center justify-center flex-shrink-0 sentinel-glow">
            <Shield className="w-[18px] h-[18px] text-primary-foreground" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="text-base font-bold text-foreground tracking-tight whitespace-nowrap"
              >
                Sentinel
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        {!collapsed && (
          <button onClick={onToggle} className="p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors">
            <ChevronLeft className="w-4 h-4 text-sidebar-foreground" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2.5 space-y-0.5">
        {navItems.map((item) => {
          const isActive = activeItem === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                if (collapsed) onToggle();
              }}
              className={`relative w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 group ${
                isActive
                  ? "bg-sentinel-blue-soft text-sentinel-blue"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-sentinel-blue"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto min-w-[20px] h-5 flex items-center justify-center bg-sentinel-red text-primary-foreground text-[10px] font-bold rounded-full px-1.5">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
              {collapsed && item.badge && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-sentinel-red rounded-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-2.5 border-t border-sidebar-border">
        <button
          onClick={() => onNavigate("settings")}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors ${
            activeItem === "settings"
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          }`}
        >
          <Settings className="w-[18px] h-[18px] flex-shrink-0" />
          {!collapsed && <span>Settings</span>}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
