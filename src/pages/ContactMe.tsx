export const ContactMe = () => {
    return (
        <div className="container mx-auto max-w-5xl px-4 py-8 pt-24">
            <h1 className="text-3xl font-bold mb-6">Contact Me</h1>
            <div className="prose dark:prose-invert max-w-none text-muted-foreground">
                <p className="mb-4">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
                <div className="grid gap-6 md:grid-cols-2 mt-8">
                    <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
                        <h3 className="font-semibold text-lg mb-2">Email</h3>
                        <p>lorem.ipsum@example.com</p>
                    </div>
                    <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
                        <h3 className="font-semibold text-lg mb-2">Social</h3>
                        <p>@loremipsum</p>
                    </div>
                </div>
                <p className="mt-8">
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                </p>
            </div>
        </div>
    )
}
