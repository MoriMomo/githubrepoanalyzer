import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("app", "routes/dashboard.tsx"),
  route("login", "routes/auth.tsx", { id: "login-page" }),
  route("auth", "routes/auth.tsx", { id: "auth-page" }),
  route("project/:id", "routes/project.tsx"),
  route("wipe", "routes/wipe.tsx"),
] satisfies RouteConfig;
