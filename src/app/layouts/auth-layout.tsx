import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-container items-center justify-center px-4 py-10 md:px-6">
      <Outlet />
    </div>
  );
}
