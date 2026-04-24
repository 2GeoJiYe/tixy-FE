import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";

interface AuthRequiredNoticeProps {
  title?: string;
  description?: string;
}

export function AuthRequiredNotice({
  title = "로그인이 필요합니다.",
  description = "로그인 후 계속 진행할 수 있습니다.",
}: AuthRequiredNoticeProps) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <EmptyState
      title={title}
      description={description}
      action={
        <Button
          onClick={() =>
            navigate("/login", {
              state: { redirectTo: `${location.pathname}${location.search}` },
            })
          }
        >
          로그인
        </Button>
      }
    />
  );
}
