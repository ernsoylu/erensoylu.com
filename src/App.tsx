import { Route, Routes } from 'react-router-dom'
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

function App() {

  return (
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
  )
}

export default App
