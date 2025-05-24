import { ReactNode } from "react";
import { UserPage } from "../views/UserPage/UserPage";
import { UserPosts } from "../views/UserPosts/UserPosts";
import HomePage from "../views/HomePage/HomePage";
import CreateContentPage from "../views/CreateContentPage/CreateContentPage";

interface Page {
  path: string;
  element: ReactNode;
  name: string;
}

const pages: Page[] = [
  {
    path: "/homePage",
    element: <HomePage />,
    name: "Home",
  },
  {
    path: "/user",
    element: <UserPage />,
    name: "User",
  },
  {
    path: "/createcontent",
    element: <CreateContentPage />,
    name: "Create Content",
  },
  {
    path: "/myposts",
    element: <UserPosts />,
    name: "My Posts",
  },
];

export { pages };
export type { Page };
