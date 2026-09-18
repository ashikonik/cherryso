"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  FolderTree, 
  ShoppingCart, 
  Users, 
  Settings,
  MessageSquare
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Categories", href: "/admin/categories", icon: FolderTree },
  { name: "Tags", href: "/admin/tags", icon: Tags },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Reviews", href: "/admin/reviews", icon: MessageSquare },
  { name: "Settings", href: "/admin/settings", icon: Settings, adminOnly: true },
]

export function Sidebar({ userRole }: { userRole: string }) {
  const pathname = usePathname()

  return (
    <div className="w-64 border-r border-border bg-card flex flex-col h-screen sticky top-0 print:hidden">
      <div className="p-6">
        <Link href="/" className="text-xl font-bold text-primary flex items-center gap-2">
          🍒 CherrySo Admin
        </Link>
      </div>
      
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          if (item.adminOnly && userRole !== "admin") return null
          
          const isActive = 
            item.href === "/admin" 
              ? pathname === "/admin" 
              : pathname === item.href || pathname.startsWith(`${item.href}/`)
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
      
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">
          Logged in as
        </div>
        <div className="text-sm font-bold capitalize">{userRole}</div>
      </div>
    </div>
  )
}
