import { Link } from "react-router-dom";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";

export function NotFoundPage() {
  return (
    <EmptyState
      title="페이지를 찾을 수 없습니다."
      description="주소가 변경되었거나 존재하지 않는 경로입니다."
      action={
        <Link to="/">
          <Button>홈으로 이동</Button>
        </Link>
      }
    />
  );
}
