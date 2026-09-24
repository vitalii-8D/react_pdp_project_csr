export const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024; // 5MB, matches backend

// Chat attachments accept any file type, so this is a size-only limit - matches backend.
export const MAX_CHAT_ATTACHMENT_SIZE_BYTES = 25 * 1024 * 1024; // 25MB
