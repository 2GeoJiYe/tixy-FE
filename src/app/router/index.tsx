import { createBrowserRouter } from "react-router-dom";
import { AdminLayout } from "@/app/layouts/admin-layout";
import { AuthLayout } from "@/app/layouts/auth-layout";
import { RootLayout } from "@/app/layouts/root-layout";
import { RequireAuth } from "@/shared/ui/route-guard";
import { LoginPage } from "@/features/auth/pages/login-page";
import { SignupPage } from "@/features/auth/pages/signup-page";
import { HomePage } from "@/features/events/pages/home-page";
import { SearchPage } from "@/features/events/pages/search-page";
import { EventDetailPage } from "@/features/events/pages/event-detail-page";
import { EventSessionsPage } from "@/features/events/pages/event-sessions-page";
import { SessionDetailPage } from "@/features/events/pages/session-detail-page";
import { SeatSelectionPage } from "@/features/booking/pages/seat-selection-page";
import { CheckoutPage } from "@/features/booking/pages/checkout-page";
import { WaitingPaymentPage } from "@/features/booking/pages/waiting-payment-page";
import { SupportHomePage } from "@/features/support/pages/support-home-page";
import { SupportRoomsPage } from "@/features/support/pages/support-rooms-page";
import { SupportRoomPage } from "@/features/support/pages/support-room-page";
import { MyPage } from "@/features/member/pages/my-page";
import { AdminSupportQueuePage } from "@/features/admin-support/pages/admin-support-queue-page";
import { AdminSupportClosedPage } from "@/features/admin-support/pages/admin-support-closed-page";
import { AdminSupportStalePage } from "@/features/admin-support/pages/admin-support-stale-page";
import { AdminSupportRoomPage } from "@/features/admin-support/pages/admin-support-room-page";
import { SalesDashboardPage } from "@/features/admin-dashboard/pages/sales-dashboard-page";
import { NotFoundPage } from "@/shared/ui/not-found-page";
import { RouteErrorPage } from "@/shared/ui/route-error-page";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: "login", element: <LoginPage /> },
          { path: "signup", element: <SignupPage /> },
        ],
      },
      { index: true, element: <HomePage /> },
      { path: "search", element: <SearchPage /> },
      { path: "events/:eventId", element: <EventDetailPage /> },
      { path: "events/:eventId/sessions", element: <EventSessionsPage /> },
      { path: "events/:eventId/sessions/:sessionId", element: <SessionDetailPage /> },
      { path: "events/:eventId/sessions/:sessionId/seats", element: <SeatSelectionPage /> },
      {
        element: <RequireAuth roles={["ROLE_USER"]} />,
        children: [
          { path: "checkout", element: <CheckoutPage /> },
          { path: "checkout/waiting-payment", element: <WaitingPaymentPage /> },
          { path: "mypage", element: <MyPage /> },
          { path: "support", element: <SupportHomePage /> },
          { path: "support/rooms", element: <SupportRoomsPage /> },
          { path: "support/rooms/:roomId", element: <SupportRoomPage /> },
        ],
      },
      {
        element: <RequireAuth roles={["ROLE_ADMIN", "ROLE_SUPER_ADMIN"]} />,
        children: [
          {
            path: "admin",
            element: <AdminLayout />,
            children: [
              { path: "support/queue", element: <AdminSupportQueuePage /> },
              { path: "support/rooms/closed", element: <AdminSupportClosedPage /> },
              { path: "support/rooms/stale", element: <AdminSupportStalePage /> },
              { path: "support/rooms/:roomId", element: <AdminSupportRoomPage /> },
            ],
          },
        ],
      },
      {
        element: <RequireAuth roles={["ROLE_SUPER_ADMIN"]} />,
        children: [
          {
            path: "admin",
            element: <AdminLayout />,
            children: [{ path: "dashboard/sales", element: <SalesDashboardPage /> }],
          },
        ],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
