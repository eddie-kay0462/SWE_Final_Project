"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import React, { useState, createContext, useContext, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IconMenu2, IconX, IconChevronLeft } from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import { Button } from "./button";
import { GraduationCap } from "lucide-react";

const SidebarContext = createContext(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate: animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...props} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}) => {
  const { open, setOpen, animate } = useSidebar();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isExpanded = !isCollapsed || isHovered;

  useEffect(() => {
    setOpen(isExpanded);
  }, [isExpanded, setOpen]);

  return (
    <>
      <motion.div
        className={cn(
          "h-screen sticky top-0 hidden md:flex md:flex-col bg-white dark:bg-[hsl(var(--sidebar))] border-r border-border relative",
          className
        )}
        animate={{
          width: animate ? (isExpanded ? "280px" : "80px") : "280px",
        }}
        initial={{
          width: "280px"
        }}
        transition={{
          duration: 0.3,
          ease: "easeInOut"
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {children}
        </div>
        
        {/* Footer with collapse button */}
        <div className="px-4 py-4 border-t border-neutral-200 dark:border-[#262626]">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors hover:bg-neutral-100 dark:hover:bg-[#262626]",
            )}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <IconChevronLeft 
              className={cn(
                "h-5 w-5 text-neutral-600 dark:text-neutral-300 transition-transform",
                isCollapsed && !isHovered ? "rotate-180" : "rotate-0"
              )}
            />
            <motion.span
              animate={{
                opacity: animate ? (isExpanded ? 1 : 0) : 1,
              }}
              className="text-sm font-medium text-neutral-600 dark:text-neutral-300"
            >
              {isCollapsed ? "Expand" : "Collapse"}
            </motion.span>
          </button>
        </div>
      </motion.div>
    </>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}) => {
  const { open, setOpen } = useSidebar();
  return (
    <>
      {/* Mobile Header with Menu Button */}
      <div
        className={cn(
          "sticky top-0 z-50 h-16 md:hidden bg-white dark:bg-[hsl(var(--sidebar))] border-b border-border",
          className
        )}
        {...props}
      >
        <div className="flex h-full items-center px-4">
          <button
            onClick={() => setOpen(!open)}
            className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-muted transition-colors"
            aria-label="Toggle Navigation"
          >
            <IconMenu2 className="h-5 w-5 text-neutral-600 dark:text-neutral-300" />
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-black md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={cn(
                "fixed inset-y-0 left-0 z-50 w-[280px] bg-white dark:bg-[hsl(var(--sidebar))] border-r border-border flex flex-col md:hidden",
                className
              )}
            >
              {/* Sidebar Header */}
              <div className="flex h-16 items-center justify-between px-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-8 w-8 text-[#A91827]" />
                  <span className="text-xl font-bold">CSOFT</span>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-muted transition-colors"
                  aria-label="Close Navigation"
                >
                  <IconX className="h-5 w-5 text-neutral-600 dark:text-neutral-300" />
                </button>
              </div>
              
              {/* Sidebar Content */}
              <div className="flex-1 overflow-y-auto px-4 py-4">
                {children}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export const SidebarLink = ({
  link,
  className,
  ...props
}) => {
  const { open, animate } = useSidebar();
  const pathname = usePathname();
  
  const isDashboard = link.href === '/dashboard';
  const isActive = isDashboard 
    ? pathname === '/dashboard'
    : pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href + '/') && !pathname.startsWith(link.href + '/../'));

  return (
    <Link
      href={link.href}
      className={cn(
        "flex items-center justify-start gap-3 group/sidebar py-3 px-3 rounded-lg transition-colors",
        isActive 
          ? "bg-[#A91827]/10 text-[#A91827]" 
          : "text-neutral-700 hover:bg-neutral-200/50 dark:text-neutral-100 dark:hover:bg-muted dark:hover:shadow-sm",
        className
      )}
      {...props}
    >
      {React.cloneElement(link.icon, {
        className: cn(
          "h-6 w-6 shrink-0",
          isActive ? "text-[#A91827]" : "text-neutral-700 dark:text-neutral-100"
        )
      })}

      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className={cn(
          "text-base group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0",
          isActive ? "text-[#A91827] font-medium" : "text-neutral-700 dark:text-neutral-100"
        )}
      >
        {link.label}
      </motion.span>
    </Link>
  );
};

export function SidebarContent({ children, className }) {
  return (
    <div className={cn("flex h-full w-full flex-col gap-4", className)}>
      {children}
    </div>
  );
}

export function SidebarHeader({ children, className }) {
  return (
    <div className={cn("flex items-center gap-2 px-6 py-4", className)}>
      {children}
    </div>
  );
}

export function SidebarMenu({ children, className }) {
  return (
    <nav className={cn("flex-1 space-y-1 px-3", className)}>
      {children}
    </nav>
  );
}

export function SidebarMenuItem({ 
  href, 
  icon: Icon, 
  children, 
  isActive,
  className,
  ...props 
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-x-3 rounded-md px-3 py-2 text-sm font-medium",
        isActive 
          ? "bg-primary/10 text-primary" 
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        className
      )}
      {...props}
    >
      {Icon && (
        <Icon
          className={cn(
            "h-5 w-5 shrink-0",
            isActive ? "text-primary" : "text-muted-foreground group-hover:text-accent-foreground"
          )}
        />
      )}
      {children}
      {isActive && (
        <motion.div
          layoutId="sidebar-active-indicator"
          className="absolute left-0 w-1 h-8 bg-primary rounded-r-full"
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30
          }}
        />
      )}
    </Link>
  );
}

export function SidebarMenuButton({ 
  icon: Icon, 
  children, 
  className,
  ...props 
}) {
  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start gap-x-3 px-3",
        className
      )}
      {...props}
    >
      {Icon && <Icon className="h-5 w-5" />}
      {children}
    </Button>
  );
}

export function SidebarFooter({ children, className }) {
  return (
    <div className={cn("mt-auto px-6 py-4", className)}>
      {children}
    </div>
  );
}