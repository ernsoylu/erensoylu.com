import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const Dashboard = () => {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-muted-foreground">+0 from last month</p>
                </CardContent>
            </Card>
            {/* Add more stats cards later */}
        </div>
    )
}
