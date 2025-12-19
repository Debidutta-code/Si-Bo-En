import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { router } from './Route.tsx'
import { RouterProvider } from 'react-router/dom'
import { Toaster } from "react-hot-toast";
import ReduxProvider from "@/redux/provider"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Toaster position="top-right" />
    <ReduxProvider>
      <RouterProvider router={router} />
    </ReduxProvider>
  </StrictMode>,
)