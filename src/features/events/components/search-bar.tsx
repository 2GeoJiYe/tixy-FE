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
      className="flex flex-col gap-3 rounded-card border border-border bg-surface p-3 shadow-card sm:flex-row"
    >
      <Input
        className="border-transparent bg-muted"
        placeholder="공연명, 설명 키워드로 검색"
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
      />
      <Button className="sm:w-32" type="submit">
        검색
      </Button>
    </form>
  );
}
