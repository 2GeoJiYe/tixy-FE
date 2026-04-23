import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";

interface AuthRequiredNoticeProps {
  title?: string;
  description?: string;
}

export function AuthRequiredNotice({
  title = "현재 백엔드 설정에서는 로그인 후 조회할 수 있습니다.",
  description = "프론트는 public browsing 구조로 설계했지만, 현재 tixy 보안 설정상 공연 목록과 상세 API가 인증을 요구합니다. 로그인 후 같은 화면으로 복귀할 수 있습니다.",
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
          로그인하고 계속
        </Button>
      }
    />
  );
}
