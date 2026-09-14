export type Lookbook = {
  id: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  updatedAt: Date;
};

export type LookbookActionResult =
  | { status: "idle"; message: "" }
  | { status: "success"; message: string; lookbook?: Lookbook }
  | { status: "error"; message: string };
