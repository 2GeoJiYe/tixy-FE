import { FormEvent, useState } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

interface SearchBarProps {
  defaultValue?: string;
  onSearch: (keyword: string) => void;
}

export function SearchBar({ defaultValue = "", onSearch }: SearchBarProps) {
  const [keyword, setKeyword] = useState(defaultValue);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(keyword.trim());
  };

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-3 rounded-[22px] border border-border bg-surface p-2 shadow-card sm:flex-row"
    >
      <label className="relative min-w-0 flex-1">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          Q
        </span>
        <Input
          className="border-transparent bg-zinc-50 pl-9"
          placeholder="공연, 아티스트, 장소를 검색해 보세요"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
        />
      </label>
      <Button className="sm:w-32" type="submit">
        찾아보기
      </Button>
    </form>
  );
}
