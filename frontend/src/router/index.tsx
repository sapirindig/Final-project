import { ReactNode } from "react";
import { UserPage } from "../views/UserPage/UserPage";
import { UserPosts } from "../views/UserPosts/UserPosts";
import LoginPage from "../views/LoginPage/LoginPage";
import HomePage from "../views/HomePage/HomePage";
import CreateContentPage from "../views/CreateContentPage/CreateContentPage";

interface Page {
    path: string,
    element: ReactNode,
    name: string,
};

const pages: Page [] = [
    {
        path: "/",
        element: <LoginPage />,
        name: "Logout",
    },
    {
        path: "/user",
        element: <UserPage />,
        name: "User",
    },
    {
        path: "/userPosts",
        element: <UserPosts />,
        name: "Your posts",
    },
    {
        path: "/homePage",
        element: <HomePage />,
        name: "Home",
    },
    {
          path: "/create-content",
          element: <CreateContentPage />,
          name: "Create Content",},
];

export { pages };
export type { Page };