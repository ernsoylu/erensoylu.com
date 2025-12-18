import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Menu, LogIn, LayoutDashboard } from "lucide-react"
import { useIsMobile } from "@/hooks/useIsMobile"
import { supabase } from "@/lib/supabase"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { SearchDialog } from "@/components/SearchDialog"

interface MenuItem {
  id: string
  label: string
  path: string
  parent_id: string | null
  grid_cols?: number
  grid_rows?: number
  children?: MenuItem[]
}

export const NavBar = () => {
  const isMobile = useIsMobile()
  const [session, setSession] = useState<any>(null)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    fetchMenu()

    return () => subscription.unsubscribe()
  }, [])

  const fetchMenu = async () => {
    const { data } = await supabase
      .from('navbar_items')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (data) {
      const itemsMap = new Map<string, MenuItem>()
      const rootItems: MenuItem[] = []

      // First pass: create items
      data.forEach(item => {
        itemsMap.set(item.id, { ...item, children: [] })
      })

      // Second pass: structure tree
      data.forEach(item => {
        const menuItem = itemsMap.get(item.id)!
        if (item.parent_id) {
          const parent = itemsMap.get(item.parent_id)
          if (parent) {
            parent.children?.push(menuItem)
          }
        } else {
          rootItems.push(menuItem)
        }
      })

      setMenuItems(rootItems)
    }
  }

  return (
    <header className="fixed top-4 z-50 w-[calc(100%-2rem)] max-w-5xl left-1/2 -translate-x-1/2 rounded-2xl bg-background/80 backdrop-blur-md shadow-sm supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">

        {/* Logo or Brand */}
        <div className="hidden md:flex items-center">
          <Link to="/" className="font-bold text-lg tracking-tight pl-2 hover:text-primary transition-colors">
            Eren SOYLU
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:block absolute left-1/2 -translate-x-1/2">
          <NavigationMenu
            viewport={!isMobile}
            className="rounded-full bg-card/80 px-4 py-2 shadow-sm backdrop-blur"
          >
            <NavigationMenuList className="gap-1">
              {menuItems.map(item => (
                <NavigationMenuItem key={item.id}>
                  {item.children && item.children.length > 0 ? (
                    <>
                      <NavigationMenuTrigger className="rounded-full px-3 py-2 text-sm font-semibold text-foreground hover:bg-primary hover:text-primary-foreground">
                        {item.label}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent className="p-4">
                        <ul
                          className="grid gap-3"
                          style={{
                            gridTemplateColumns: `repeat(${item.grid_cols || 1}, 1fr)`,
                            width: `${(item.grid_cols || 1) * 200}px`,
                            maxWidth: '90vw'
                          }}
                        >
                          {item.children.map(child => (
                            <li key={child.id} className="row-span-1">
                              <NavigationMenuLink asChild>
                                <Link
                                  to={child.path}
                                  className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                >
                                  <div className="text-sm font-medium leading-none">{child.label}</div>
                                  <p className="line-clamp-2 text-sm leading-snug text-muted-foreground opacity-70">
                                    {/* Description could go here if we had one, for now just path for debug or cleaner look without? Keeping it clean. */}
                                  </p>
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </>
                  ) : (
                    <NavigationMenuLink asChild>
                      <Link
                        to={item.path}
                        className="rounded-full px-3 py-2 text-sm font-semibold text-foreground hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        {item.label}
                      </Link>
                    </NavigationMenuLink>
                  )}
                </NavigationMenuItem>
              ))}

              {/* Fallback if no menu items (e.g. initial load or empty DB) */}
              {menuItems.length === 0 && (
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link to="/" className="rounded-full px-3 py-2 text-sm font-semibold">Home</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Desktop Search & Login */}
        <div className="hidden md:flex items-center gap-2">
          <SearchDialog />

          {session ? (
            <Link to="/admin" className="inline-flex items-center justify-center rounded-full p-2 text-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none" title="Dashboard">
              <LayoutDashboard className="h-5 w-5" />
              <span className="sr-only">Dashboard</span>
            </Link>
          ) : (
            <Link to="/login" className="inline-flex items-center justify-center rounded-full p-2 text-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none">
              <LogIn className="h-5 w-5" />
              <span className="sr-only">Login</span>
            </Link>
          )}
        </div>

        {/* Mobile Navigation Toggle */}
        <div className="flex md:hidden w-full items-center justify-between">
          <Link to="/" className="font-bold text-lg tracking-tight">Eren SOYLU</Link>
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <button
                className="inline-flex items-center justify-center rounded-md p-2 text-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none"
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="pt-10 pr-6 pl-6 flex flex-col h-full">
              <SheetHeader className="text-left mb-6">
                <SheetTitle className="text-xl font-bold">
                  <Link to="/" onClick={() => setIsSheetOpen(false)}>Eren SOYLU</Link>
                </SheetTitle>
              </SheetHeader>

              {/* Mobile Search */}
              <div className="mb-6">
                <SearchDialog mobile />
              </div>

              <div className="flex flex-col space-y-6 flex-1">
                {menuItems.map(item => (
                  <div key={item.id}>
                    {item.children && item.children.length > 0 ? (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-muted-foreground uppercase text-xs tracking-wider">{item.label}</h4>
                        <div className="flex flex-col space-y-3 pl-4 border-l-2 border-border/50">
                          {item.children.map(child => (
                            <Link
                              key={child.id}
                              to={child.path}
                              onClick={() => setIsSheetOpen(false)}
                              className="block text-base font-medium text-foreground/80 hover:text-primary transition-colors"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <Link
                        to={item.path}
                        onClick={() => setIsSheetOpen(false)}
                        className="block text-lg font-medium text-foreground hover:text-primary transition-colors"
                      >
                        {item.label}
                      </Link>
                    )}
                  </div>
                ))}

                {session && (
                  <Link
                    to="/admin"
                    onClick={() => setIsSheetOpen(false)}
                    className="block text-lg font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Dashboard
                  </Link>
                )}
              </div>

              {/* Mobile Login at Bottom */}
              <div className="border-t pt-4 mt-auto pb-6">
                {session ? (
                  <Link
                    to="/admin" // Or handle logout
                    onClick={() => setIsSheetOpen(false)}
                    className="flex items-center gap-2 text-lg font-medium text-foreground hover:text-primary transition-colors"
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    Dashboard
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsSheetOpen(false)}
                    className="flex items-center gap-2 text-lg font-medium text-foreground hover:text-primary transition-colors"
                  >
                    <LogIn className="h-5 w-5" />
                    Login
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
