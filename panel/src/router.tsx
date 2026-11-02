import { createBrowserRouter } from 'react-router'
import { Shell } from './components/Shell'
import { LoginPage } from './routes/LoginPage'
import { NotFoundPage, RouteErrorPage } from './routes/NotFoundPage'
import { RequestsPage } from './routes/RequestsPage'
import { StaffPage } from './routes/StaffPage'
import { TwoFactorPage } from './routes/TwoFactorPage'
// Dalga 2 content (Lane F)
import { ContentEditorPage } from './routes/content/ContentEditorPage'
import { ContentListPage } from './routes/content/ContentListPage'
import { OrderingPage } from './routes/content/OrderingPage'
import { MediaPage } from './routes/media/MediaPage'
import { PublishPage } from './routes/publish/PublishPage'

/** Paths are relative to /panel (Vite `base`); the Shell's gate decides which one may render. */
export const router = createBrowserRouter(
  [
    {
      element: <Shell />,
      errorElement: <RouteErrorPage />,
      children: [
        { index: true, element: <RequestsPage /> },
        { path: 'giris', element: <LoginPage /> },
        { path: '2fa', element: <TwoFactorPage /> },
        { path: 'kullanicilar', element: <StaffPage /> },
        // Dalga 2 content (Lane F)
        { path: 'icerik', element: <ContentListPage /> },
        { path: 'icerik/siralama', element: <OrderingPage /> },
        { path: 'icerik/:type/:id', element: <ContentEditorPage /> },
        { path: 'medya', element: <MediaPage /> },
        { path: 'yayin', element: <PublishPage /> },
        { path: '*', element: <NotFoundPage /> },
      ],
    },
  ],
  { basename: '/panel' },
)
