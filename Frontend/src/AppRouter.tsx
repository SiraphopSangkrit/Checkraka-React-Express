import { createBrowserRouter } from "react-router";
import AppLayout from "./Layout/AppLayout";
import AdminLayout from "./Layout/AdminLayout";
import Index from "./Pages";
import AdminModel from "./Pages/Admin/AdminModel";
import AdminProduct from "./Pages/Admin/Products/AdminProduct";
import AdminBrand from "./Pages/Admin/AdminBrand";
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
        element: <AdminProduct />,
      },
      {
        path: "brands",
        element: <AdminBrand />,
      },
      {
        path: "models",
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
