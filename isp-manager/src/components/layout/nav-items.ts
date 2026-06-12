import {
  LayoutDashboard,
  Users,
  Truck,
  Fuel,
  HardHat,
  FileText,
  UserCheck,
  Package,
  Warehouse,
  Radio,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { Modulo } from "@/generated/prisma/enums";

export interface NavItem {
  modulo: Modulo;
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { modulo: "DASHBOARD",    label: "Dashboard",    href: "/dashboard",     icon: LayoutDashboard },
  { modulo: "EMPLEADOS",    label: "Empleados",    href: "/empleados",     icon: Users           },
  { modulo: "FLOTA",        label: "Flota",        href: "/flota",         icon: Truck           },
  { modulo: "COMBUSTIBLE",  label: "Combustible",  href: "/combustible",   icon: Fuel            },
  { modulo: "CUADRILLAS",   label: "Cuadrillas",   href: "/cuadrillas",    icon: HardHat         },
  { modulo: "PRESUPUESTOS", label: "Presupuestos", href: "/presupuestos",  icon: FileText        },
  { modulo: "CLIENTES",     label: "Clientes",     href: "/clientes",      icon: UserCheck       },
  { modulo: "ITEMS",        label: "Items facturables", href: "/items",    icon: Package         },
  { modulo: "STOCK",        label: "Stock",        href: "/stock",         icon: Warehouse       },
  { modulo: "RED",          label: "Red",          href: "/red",           icon: Radio           },
  { modulo: "ADMIN",        label: "Administración", href: "/admin",       icon: Settings        },
];
