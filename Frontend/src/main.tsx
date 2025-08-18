import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./App.css";
import { RouterProvider } from "react-router";
import router from "./AppRouter";
import { HeroUIProvider, ToastProvider } from "@heroui/react";
import { CategoriesProvider } from "./contexts/CategoriesContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HeroUIProvider>
     <ToastProvider/>
     <CategoriesProvider>
        <div className="text-foreground bg-default min-h-screen">
          <RouterProvider router={router} />
        </div>
     </CategoriesProvider>
    </HeroUIProvider>
  </StrictMode>
);
