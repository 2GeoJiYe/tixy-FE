export const supportApiPaths = {
  rooms: "/support/v1/rooms",
  myRooms: "/support/v1/rooms/me",
  room: (roomId: number) => `/support/v1/rooms/${roomId}`,
  roomMessages: (roomId: number) => `/support/v1/rooms/${roomId}/messages`,
  counselorRequest: (roomId: number) => `/support/v1/rooms/${roomId}/counselor-request`,
  adminQueue: "/admin/support/v1/queue",
  adminClosedRooms: "/admin/support/v1/rooms/closed",
  adminStaleRooms: "/admin/support/v1/rooms/stale",
  adminClaim: (roomId: number) => `/admin/support/v1/rooms/${roomId}/claim`,
  adminRelease: (roomId: number) => `/admin/support/v1/rooms/${roomId}/release`,
  adminSolve: (roomId: number) => `/admin/support/v1/rooms/${roomId}/solve`,
  adminClose: (roomId: number) => `/admin/support/v1/rooms/${roomId}/close`,
} as const;

export const supportStompPaths = {
  room: (roomId: number) => `/tixypt/sub/support/v1/rooms/${roomId}`,
  roomRead: (roomId: number) => `/tixypt/sub/support/v1/rooms/${roomId}/read`,
  queue: "/tixypt/sub/support/v1/queue",
  userRead: "/tixypt/user/tixypt/queue/support/v1/read",
  publishMessage: (roomId: number) => `/tixypt/pub/support/v1/rooms/${roomId}/messages`,
  publishRead: (roomId: number) => `/tixypt/pub/support/v1/rooms/${roomId}/read`,
} as const;
