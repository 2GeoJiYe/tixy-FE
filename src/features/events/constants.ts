export const categoryOptions = [
  { value: "MUSICAL", label: "뮤지컬" },
  { value: "CONCERT", label: "콘서트" },
  { value: "PLAY", label: "연극" },
  { value: "EXHIBITION", label: "전시" },
  { value: "SPORT", label: "스포츠" },
] as const;

export const locationOptions = [
  { value: "SEOUL", label: "서울" },
  { value: "GYEONGGI", label: "경기" },
  { value: "BUSAN", label: "부산" },
  { value: "GANGWON", label: "강원" },
  { value: "CHUNGBUK", label: "충북" },
  { value: "CHUNGNAM", label: "충남" },
  { value: "JEONBUK", label: "전북" },
  { value: "JEONNAM", label: "전남" },
  { value: "GYEONGBUK", label: "경북" },
  { value: "GYEONGNAM", label: "경남" },
  { value: "JEJU", label: "제주" },
] as const;

export const eventSortOptions = [
  { value: "recommended", label: "추천순" },
  { value: "openDate", label: "오픈일순" },
  { value: "closingSoon", label: "마감 임박순" },
] as const;
