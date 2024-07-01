import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function Navbar() {
  const navigate = useLocation();
  const isMoviePage = useMemo(() => location.pathname.includes("/movie"), [navigate.pathname]);

  return (
    <div className={`navbar bg-primary z-50 ${isMoviePage ? "fixed" : "static"}`}>
      <div className="flex-none">
        <NavbarDropdown />
      </div>
      <div className="flex-1">
        <h2 className="font-bold text-2xl tracking-wider">
          <Link to="/">Cinema</Link>
        </h2>
      </div>
      <div className="flex-none w-fit">
        <Link to={items[1].href}>
          <button className="btn btn-secondary w-fit">Đặt vé ngay</button>
        </Link>
      </div>
    </div>
  );
}
const items = [
  {
    label: "Lịch chiếu",
    href: "/phim-dang-chieu",
  },
  {
    label: "Đặt vé",
    href: "/phim-dang-chieu",
  },
  {
    label: "Đăng nhập",
    href: "/dang-nhap",
  },
  {
    label: "Đăng ký",
    href: "/dang-ky",
  },
];
function NavbarDropdown() {
  const auth = useAuth();
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="btn btn-square btn-ghost">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="inline-block w-5 h-5 stroke-current"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content className="bg-base-100 drop-shadow-md px-2 py-3 rounded-md min-w-[25vh] mx-2 border-2 border-base-200">
          {items.map((item, index) => {
            if (auth?.user && index === 2)
              return (
                <DropdownMenu.Item
                  className="px-3 py-2 hover:bg-base-300 cursor-pointer rounded-md transition-all"
                  key={item.href}
                >
                  <button
                    onClick={() => {
                      auth.signout();
                    }}
                  >
                    Đăng xuất
                  </button>
                </DropdownMenu.Item>
              );
            if (auth?.user && index === 3) return null;
            return (
              <DropdownMenu.Item
                className="px-3 py-2 hover:bg-base-300 cursor-pointer rounded-md transition-all"
                key={item.href}
              >
                <Link to={item.href}>{item.label}</Link>
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
export default Navbar;
