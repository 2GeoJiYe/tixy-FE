import { isRouteErrorResponse, useRouteError } from "react-router-dom";
import { Link } from "react-router-dom";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";

export function RouteErrorPage() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <EmptyState
        title={`${error.status} 오류가 발생했습니다.`}
        description={error.statusText || "요청을 처리하는 중 문제가 발생했습니다."}
        action={
          <Link to="/">
            <Button>홈으로 이동</Button>
          </Link>
        }
      />
    );
  }

  return (
    <EmptyState
      title="화면을 열지 못했습니다."
      description="일시적인 오류가 발생했습니다. 다시 시도하거나 홈으로 이동해 주세요."
      action={
        <Link to="/">
          <Button>홈으로 이동</Button>
        </Link>
      }
    />
  );
}
