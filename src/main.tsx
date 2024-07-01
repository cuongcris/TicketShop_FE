import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { ProvideAuth } from "./hooks/useAuth";
import { ToastProvider } from "./hooks/useToast";
import "./index.css";
import { router } from "./lib/router";

export const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ProvideAuth>
      <ToastProvider>
        <QueryClientProvider client={queryClient}>
          <Suspense fallback={<div>Loading...</div>}>
            <RouterProvider router={router} />
          </Suspense>
        </QueryClientProvider>
      </ToastProvider>
    </ProvideAuth>
  </React.StrictMode>
);
