// Shared view-model types used by multiple components, so they aren't
// redefined in several places.

export type EventRoleName = "ORGANIZER" | "UPLOADER" | "VIEWER";

/** Event shape used in list/grid cards. */
export type EventPreview = {
  id: string;
  title: string;
  coverImage?: string | null;
  _count?: {
    media: number;
  };
};

/** A member row shown in the organizer's members panel. */
export type EventMemberView = {
  userId: string;
  name: string;
  email: string;
  role: EventRoleName;
  isCreator: boolean;
};

/** Media item shape consumed by the gallery and media modal. */
export type GalleryMedia = {
  id: string;
  url: string;
  fileType: string;
  fileName: string | null;
  originalName: string | null;
  likes: {
    id: string;
    userId: string;
  }[];
  comments: {
    id: string;
    content: string;
  }[];
  tags: {
    id: string;
    name: string;
  }[];
};
