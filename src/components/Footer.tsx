
import { Link } from "react-router-dom"
import { Github, Twitter, Linkedin, Mail } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export const Footer = () => {
    return (
        <footer className="bg-muted/30 border-t mt-auto">
            <div className="container mx-auto px-4 py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
                    <div className="md:col-span-2 space-y-4">
                        <Link to="/" className="font-bold text-xl tracking-tight">Eren SOYLU</Link>
                        <p className="text-muted-foreground max-w-sm">
                            Sharing thoughts on technology, development, and building products.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Navigation</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link>
                            </li>
                            <li>
                                <Link to="/posts" className="text-muted-foreground hover:text-primary transition-colors">Posts</Link>
                            </li>
                            <li>
                                <Link to="/pages" className="text-muted-foreground hover:text-primary transition-colors">Pages</Link>
                            </li>
                            <li>
                                <Link to="/admin" className="text-muted-foreground hover:text-primary transition-colors">Admin</Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Connect</h3>
                        <div className="flex gap-4">
                            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                                <Github className="h-5 w-5" />
                                <span className="sr-only">GitHub</span>
                            </a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                                <Twitter className="h-5 w-5" />
                                <span className="sr-only">Twitter</span>
                            </a>
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                                <Linkedin className="h-5 w-5" />
                                <span className="sr-only">LinkedIn</span>
                            </a>
                            <a href="mailto:hello@example.com" className="text-muted-foreground hover:text-primary transition-colors">
                                <Mail className="h-5 w-5" />
                                <span className="sr-only">Email</span>
                            </a>
                        </div>
                    </div>
                </div>

                <Separator className="my-8" />

                <div className="flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
                    <p>© {new Date().getFullYear()} Eren Soylu. All rights reserved.</p>
                    <div className="flex gap-4 mt-4 md:mt-0">
                        <Link to="/page/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
                        <Link to="/page/terms-of-service" className="hover:text-primary transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
