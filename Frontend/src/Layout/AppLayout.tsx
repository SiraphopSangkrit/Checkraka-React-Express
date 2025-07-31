import NavbarMain from "../Components/Navbar";
import Footer from "../Components/Footer";
import { Outlet } from "react-router";
export default function AppLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <NavbarMain />
      <main className="flex-grow">
      <Outlet />
      </main>
      <Footer />
    </div>
  );
}
