import { avatarUrl } from '../lib/images';
import { formatDate } from '../lib/format';
import type { UserEntity } from '../lib/types';

interface PostAuthorMetaProps {
  author: UserEntity;
  createdAt: string;
  readingTimeMinutes?: number;
  viewCount?: number;
}

export function PostAuthorMeta({ author, createdAt, readingTimeMinutes, viewCount }: PostAuthorMetaProps) {
  return (
    <div className="flex items-center space-x-3">
      <img
        className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-100"
        src={author.avatar?.url ?? avatarUrl(author.id)}
        alt={author.name}
      />
      <div>
        <p className="text-sm font-bold text-slate-900">{author.name}</p>
        <p className="text-xs text-slate-400">
          {formatDate(createdAt)}
          {readingTimeMinutes !== undefined && <> · {readingTimeMinutes} min read</>}
          {viewCount !== undefined && <> · {viewCount} views</>}
        </p>
      </div>
    </div>
  );
}
