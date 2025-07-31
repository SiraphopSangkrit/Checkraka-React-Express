import { createBrowserRouter } from "react-router";
import AppLayout from "./Layout/AppLayout";
import AdminLayout from "./Layout/AdminLayout";
import Index from "./Pages";
import AdminModel from "./Pages/Admin/Products/AdminModel";
import AdminCategory from "./Pages/Admin/Products/AdminCategory";
import AdminBrand from "./Pages/Admin/Products/AdminBrand";
import AdminProductCategory from "./Pages/Admin/AdminProductCategory";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Index />,
      },
    ],
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <div>test</div>,
      },
      {
        path: "product/:category",
        element: <AdminCategory />,
      },
      {
        path: "product/:category/brand",
        element: <AdminBrand />,
      },
      {
        path: "product/:category/models",
        element: <AdminModel />,
      },
      {
        path: "categories",
        element: <AdminProductCategory />,
      },
      {
        path: "users",
        element: <div>Admin Users</div>,
      }
    ],
  },
]);

export default router;
