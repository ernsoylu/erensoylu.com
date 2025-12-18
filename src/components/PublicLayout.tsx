import { Outlet } from "react-router-dom"
import { NavBar } from "@/components/NavBar"
import { Footer } from "@/components/Footer"

export const PublicLayout = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <NavBar />
            <div className="pt-20 flex-1">
                <Outlet />
            </div>
            <Footer />
        </div>
    )
}
