import io from "socket.io-client";
import { useEffect,useState } from "react";
import Room from "./pages/Room.jsx";
import Login from "./pages/Login.jsx";
import RoomList from "./pages/RoomList.jsx";
import { AuthContextProvider } from "./assets/Contexts/AuthContext.jsx";
import { createBrowserRouter, RouterProvider, Outlet, useLocation } from "react-router-dom";

const socket = io.connect("http://localhost:3001");
function Layout() {
  const location = useLocation()
  useEffect(() => {
    if (location.pathname === "/") {
      document.title = "Home";
    } else if (location.pathname.startsWith("/room/")) {
      document.title = "Room Play";
    } else if (location.pathname === "/login") {
      document.title = "Login";
    }
  }, [location.pathname]);
  return (
    <AuthContextProvider>
      <Outlet />
    </AuthContextProvider>
  );
}

function App() {
  const router = createBrowserRouter([
    {
      element: <Layout />,
      children: [
        {
          path: "/",
          element: <RoomList />,
        },
        {
          path: "/room/:room",
          element: <Room />,
        },
        {
          path: "/login",
          element: <Login />,
        },
      ],
    },
  ]);

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
