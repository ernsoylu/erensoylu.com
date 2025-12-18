import { Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { logger } from "@/lib/logger"
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { PostView } from './pages/PostView'
import { PageView } from './pages/PageView'
import { PostListView } from './pages/PostListView'
import { PageListView } from './pages/PageListView'

import { PublicLayout } from './components/PublicLayout'
import { AdminLayout } from './components/AdminLayout'
import { Dashboard } from './components/admin/Dashboard'
import { MenuManager } from './components/admin/MenuManager'
import { CategoryManager } from './components/admin/CategoryManager'
import { FileManager } from './components/admin/FileManager'
import { PostManager } from './components/admin/PostManager'
import { PageManager } from './components/admin/PageManager'
import { FrontPageManager } from './components/admin/FrontPageManager'
import { Toaster } from "@/components/ui/sonner"


const RouteLogger = () => {
  const location = useLocation()

  useEffect(() => {
    logger.view('App', { path: location.pathname, search: location.search })
  }, [location])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // @ts-ignore
      const target = e.target as HTMLElement
      const element = target.closest('button, a, input, [role="button"]') || target
      // shorten innerText
      const label = element.textContent?.substring(0, 30)?.replace(/\n/g, ' ') || element.getAttribute('aria-label') || element.tagName
      logger.action('GlobalClick', `Clicked ${element.tagName}`, {
        path: location.pathname,
        label,
        id: element.id,
        className: element.className
      })
    }

    if (logger.isEnabled) {
      window.addEventListener('click', handleClick)
    }
    return () => window.removeEventListener('click', handleClick)
  }, [location])

  return null
}


import { ScrollToTop } from './components/ScrollToTop'

function App() {

  return (
    <div>
      <ScrollToTop />
      <RouteLogger />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/post/:slug" element={<PostView />} />
          <Route path="/page/:slug" element={<PageView />} />
          <Route path="/posts" element={<PostListView />} />
          <Route path="/pages" element={<PageListView />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="posts" element={<PostManager />} />
          <Route path="pages" element={<PageManager />} />
          <Route path="categories" element={<CategoryManager />} />
          <Route path="media" element={<FileManager />} />
          <Route path="menu" element={<MenuManager />} />
          <Route path="front-page" element={<FrontPageManager />} />
        </Route>
      </Routes>
      <Toaster />
    </div>
  )
}

export default App
