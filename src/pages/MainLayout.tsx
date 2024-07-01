import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

function MainLayout() {
  return (
    <div className="">
      <Navbar />
      <div className="container mx-auto">
        <Outlet />
      </div>
    </div>
  );
}

export default MainLayout;
