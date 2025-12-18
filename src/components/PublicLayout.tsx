import { Outlet } from "react-router-dom"
import { NavBar } from "@/components/NavBar"

export const PublicLayout = () => {
    return (
        <>
            <NavBar />
            <div className="pt-24">
                <Outlet />
            </div>
        </>
    )
}
