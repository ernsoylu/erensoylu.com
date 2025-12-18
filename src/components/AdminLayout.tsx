import { useEffect, useState } from "react"
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { logger } from "@/lib/logger"
import {
    LayoutDashboard,
    FileText,
    Files,
    Image as ImageIcon,
    Menu as MenuIcon,
    LogOut,
    List
} from "lucide-react"
import { Button } from "@/components/ui/button"

export const AdminLayout = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                logger.action("AdminLayout", "Auth Check Failed", { redirect: "/login" })
                navigate("/login")
            } else {
                logger.action("AdminLayout", "Auth Check Passed", { user: session.user.email })
            }
            setLoading(false)
        })

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session) {
                navigate("/login")
            }
        })

        return () => subscription.unsubscribe()
    }, [navigate])

    const handleSignOut = async () => {
        logger.action("AdminLayout", "Sign Out Initiated")
        await supabase.auth.signOut()
        navigate("/login")
    }

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>
    }

    const navItems = [
        { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
        { label: "Front Page", icon: LayoutDashboard, path: "/admin/front-page" }, // Use Layout Icon for now
        { label: "Posts", icon: FileText, path: "/admin/posts" },
        { label: "Pages", icon: Files, path: "/admin/pages" },
        { label: "Categories", icon: List, path: "/admin/categories" },
        { label: "Media", icon: ImageIcon, path: "/admin/media" },
        { label: "Menu", icon: MenuIcon, path: "/admin/menu" },
    ]

    return (
        <div className="min-h-screen w-full bg-muted/40">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 bottom-0 z-10 hidden w-64 flex-col border-r bg-background sm:flex">
                <div className="flex flex-col gap-4 px-4 py-4 flex-1">
                    <div className="text-xl font-bold tracking-tight px-2">Admin Panel</div>
                    <nav className="flex flex-col gap-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${location.pathname === item.path || (item.path !== "/admin" && location.pathname.startsWith(item.path))
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:text-primary hover:bg-muted"
                                    }`}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>
                {/* Sign Out Button - Pushed to bottom */}
                <div className="p-4 border-t">
                    <Button variant="outline" className="w-full justify-start gap-2" onClick={handleSignOut}>
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex flex-1 flex-col sm:pl-64">
                <div className="flex-1 space-y-4 p-8 pt-6">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}
