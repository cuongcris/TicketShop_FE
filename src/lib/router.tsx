import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import { Product } from "../entity/Product";
import Home from "../pages/Home";
import Login from "../pages/Login";
import MainLayout from "../pages/MainLayout";
import OnGoingPage from "../pages/OnGoingPage";
import Register from "../pages/Register";
import AdminLayout from "../pages/admin/AdminLayout";
import appfetch from "./axios";
const MoviesPage = lazy(() => import("../pages/admin/MoviesPage"));
const TicketsPage = lazy(() => import("../pages/admin/TicketsPage"));
const Checkout = lazy(() => import("../pages/Checkout"));
const ShowTimePage = lazy(() => import("../pages/admin/ShowTime"));
const Dashboard = lazy(() => import("../pages/admin/Dashboard"));
const EmployeePage = lazy(() => import("../pages/admin/EmployeePage"));
const ProductPage = lazy(() => import("../pages/admin/ProductPage"));
const CustomerPage = lazy(() => import("../pages/admin/CustomerPage"));
const MoviePage = lazy(() => import("../pages/MoviePage"));

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        path: "/",
        element: <Home />,
      },
      {
        path: "movie/:id",
        element: <MoviePage />,
        loader: async ({ params }) => {
          const res = await fetch(
            `https://localhost:7193/api/Movies/${params.id}`
          );
          const data = await res.json();
          if (!data) throw new Error("Not found");
          if (data.video) {
            //If movie has trailer, fetch trailer
            const options = {
              method: "GET",
              headers: {
                accept: "application/json",
                Authorization:
                  "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2NGFkYzQ5NTBlZDg0YzNlOTJkZjA1YjgyNGVlM2Q2MSIsIm5iZiI6MTcyMDU4NDU5Ni44MjA4MTgsInN1YiI6IjY2OGUwODg0NzBjYzc4YzlkNmM4YmRhZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Y78k2XGQ0X51TyDTtCcDKH4H4siEthbL9r26gBGu2eg",
              },
            };
            fetch(
              "https://api.themoviedb.org/3/trending/movie/day?language=en-US",
              options
            )
              .then((response) => response.json())
              .then((response) => console.log(response))
              .catch((err) => console.error(err));
            //data.video = video;
          }
          return data; //return movie
        },
      },
      {
        path: "phim-dang-chieu",
        element: <OnGoingPage />,
        loader: async () => {
          const res = await fetch(`https://localhost:7193/api/Movies`);
          const data = await res.json();
          if (!data) throw new Error("Not found");
          return data;
        },
      },
    ],
  },
  {
    path: "checkout",
    element: <Checkout />,
    loader: async () => {
      //Get product
      const res = await appfetch<Product[]>("/Products");

      if (res.status === 200) {
        return res.data;
      } else
        throw new Error("Internal server error, please try again later", {
          cause: res.data,
        });
    },
  },
  {
    path: "dang-nhap",
    element: <Login />,
  },
  {
    path: "dang-ky",
    element: <Register />,
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "ticket",
        element: <TicketsPage />,
      },
      {
        path: "product",
        element: <ProductPage />,
      },
      {
        path: "employee",
        element: <EmployeePage />,
      },
      {
        path: "movie",
        element: <MoviesPage />,
      },
      {
        path: "showtime",
        element: <ShowTimePage />,
      },
      {
        path: "customer",
        element: <CustomerPage />,
      },
    ],
  },
]);
