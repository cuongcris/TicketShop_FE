import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function Navbar() {
  const navigate = useLocation();
  const isMoviePage = useMemo(
    () => location.pathname.includes("/movie"),
    [navigate.pathname]
  );

  // authen
  const auth = useAuth();
  const token = auth?.user?.token;
  const decodedToken = parseJwt(token);
  console.log("Decoded Token:", JSON.stringify(decodedToken, null, 2));
  const isAdmin =
    decodedToken &&
    decodedToken[
      "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
    ] === "Admin";

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

  if (isAdmin) {
    items.push({
      label: "Admin",
      href: "/admin",
    });
  }

  return (
    <div
      className={`navbar bg-primary z-50 ${isMoviePage ? "fixed" : "static"}`}
    >
      <div className="flex-none">
        <NavbarDropdown items={items} auth={auth} />
      </div>
      <div className="flex-1">
        <h2 className="font-bold text-2xl tracking-wider">
          <Link to="/">Cinematic</Link>
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

function NavbarDropdown({ items, auth }) {
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
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            ></path>
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

// Utility function to decode JWT token
function parseJwt(token) {
  try {
    if (!token) {
      return null;
    }
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Invalid token", e);
    return null;
  }
}

export default Navbar;
