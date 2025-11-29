import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  ScrollRestoration,
} from "react-router-dom";

// Protected Routes
import PrivateRoute from "./components/protected-roures/PrivateRoute";
import AuthRoute from "./components/protected-roures/AuthRoute";

// Pages
import Navbar from "./components/global/Navbar";
import Home from "./pages/home/Home";
import Register from "./pages/auth/Register/Register";
import Login from "./pages/auth/login/Login";
import Notifications from "./pages/notifications/Notifications";
import Network from "./pages/network/Network";
import SinglePost from "./pages/post/SinglePost";
import Profile from "./pages/profile/Profile";
import Chat from "./pages/chat/Chat";

const App = () => {
  const Layout = () => {
    return (
      <div className="min-h-screen bg-[#F3F2EF]">
        {/* Navigation */}
        <Navbar />
        <ScrollRestoration />
        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-6">
          <Outlet />
        </main>
      </div>
    );
  };

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        // Auth Routes (only accessible when logged out)
        {
          element: <AuthRoute />,
          children: [
            { path: "login", element: <Login /> },
            { path: "register", element: <Register /> },
          ],
        },

        // Protected Routes (only accessible when logged in)
        {
          element: <PrivateRoute />,
          children: [
            { path: "/", element: <Home /> },
            { path: "/notifications", element: <Notifications /> },
            { path: "/network", element: <Network /> },
            { path: "/post/:postId", element: <SinglePost /> },
            { path: "/profile/:username", element: <Profile /> },
            { path: "/chat", element: <Chat /> },
          ],
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
};

export default App;
