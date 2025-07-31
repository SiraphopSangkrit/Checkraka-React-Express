import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./App.css";
import { RouterProvider } from "react-router";
import router from "./AppRouter";
import { HeroUIProvider } from "@heroui/react";


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HeroUIProvider>
     
        <div className="text-foreground bg-default min-h-screen">
          <RouterProvider router={router} />
        </div>
     
    </HeroUIProvider>
  </StrictMode>
);
