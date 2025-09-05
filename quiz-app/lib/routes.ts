export type AppRoute = {
  path: string;
  title: string;
  description?: string;
};

export const appRoutes: AppRoute[] = [
  {
    path: "/",
    title: "Home",
    description: "Go back to the homepage",
  },
  {
    path: "/dashboard",
    title: "Dashboard",
    description: "View your analytics and progress",
  },
  {
    path: "/profile",
    title: "Profile",
    description: "Manage your account and settings",
  },
  {
    path: "/dashboard/quizzes",
    title: "Quizzes",
    description: "View and take quizzes if not created create one ",
  },
  {
    path: "/dashboard/results",
    title: "Results",
    description: "View Quizzes taken and find where you were wrong!",
  },
  {
    path: "/login",
    title: "Login",
    description: "Sign in to your account",
  },
  {
    path: "/register",
    title: "Register",
    description: "Create a new account",
  },
];
