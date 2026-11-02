import { createBrowserRouter } from 'react-router'
import { Shell } from './components/Shell'
import { FormEditorPage } from './routes/forms/FormEditorPage'
import { FormsPage } from './routes/forms/FormsPage'
import { LoginPage } from './routes/LoginPage'
import { NotFoundPage, RouteErrorPage } from './routes/NotFoundPage'
import { RequestsPage } from './routes/RequestsPage'
import { StaffPage } from './routes/StaffPage'
import { TwoFactorPage } from './routes/TwoFactorPage'

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
        { path: 'formlar', element: <FormsPage /> },
        { path: 'formlar/:kind', element: <FormEditorPage /> },
        { path: '*', element: <NotFoundPage /> },
      ],
    },
  ],
  { basename: '/panel' },
)
