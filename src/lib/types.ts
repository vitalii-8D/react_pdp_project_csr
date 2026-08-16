import { SocialPlatform } from '../enums/social-platform.enum';
import { UserRole } from '../enums/user-role.enum';
import { PostStatus } from '../enums/post-status.enum';
import { PaymentTransactionStatus, PostPaymentStatus } from '../enums/payment-status.enum';

export interface UserAvatarEntity {
  id: string;
  url: string;
}

export interface UserEntity {
  id: string;
  email: string;
  name: string;
  age?: number | null;
  role: UserRole;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isOnline: boolean;
  createdAt: string;
  posts?: PostEntity[] | null;
  avatar?: UserAvatarEntity | null;
}

export interface CategoryEntity {
  id: string;
  name: string;
  description?: string | null;
}

export interface PostImageEntity {
  id: string;
  key: string;
  url: string;
  originalFileName: string;
  mimeType: string;
  sizeBytes: number;
  altText?: string | null;
}

export interface PostEntity {
  id: string;
  title: string;
  content: string;
  slug: string;
  status: PostStatus;
  viewCount: number;
  readingTimeMinutes: number;
  commentCount: number;
  averageRating?: number | null;
  hasBeenPublished: boolean;
  paymentStatus: PostPaymentStatus;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  author: UserEntity;
  categories?: CategoryEntity[] | null;
  postImage?: PostImageEntity | null;
  // Only `image`/`imageAlt` are used (as the post's cover image) — the rest of this backend
  // entity (title/description/tags/etc.) exists purely for SEO <meta> tags, dropped in this CSR app.
  openGraphMetadata?: { image?: string | null; imageAlt?: string | null } | null;
}

export interface PaymentTransactionEntity {
  id: string;
  status: PaymentTransactionStatus;
  amount: number;
  currency: string;
  stripePaymentIntentId?: string | null;
  failureReason?: string | null;
  refundedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  post: {
    id: string;
    title: string;
    slug: string;
  };
}

export interface CommentEntity {
  id: string;
  content: string;
  rating: number;
  postId: string;
  authorId: string;
  author: UserEntity;
  createdAt: string;
  updatedAt: string;
}

export interface ShareLinks {
  [SocialPlatform.Facebook]: string;
  [SocialPlatform.Twitter]: string;
  [SocialPlatform.LinkedIn]: string;
  [SocialPlatform.Whatsapp]: string;
  [SocialPlatform.Telegram]: string;
}

export interface AuthResponse {
  accessToken: string;
  user: UserEntity;
}

export interface ChatMessageUser {
  id: string;
  name: string;
  email: string;
}

export interface ChatRoomEntity {
  id: string;
  name: string;
  description?: string | null;
  isDirect: boolean;
  participants: ChatMessageUser[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessageEntity {
  id: string;
  message: string;
  userId: string;
  user: ChatMessageUser;
  roomId: string;
  createdAt: string;
  isAdminBroadcast?: boolean;
}

export interface PresignedUploadPayload {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

export interface PublishPostResult {
  post?: Pick<PostEntity, 'id' | 'status' | 'paymentStatus' | 'hasBeenPublished'> | null;
  checkoutUrl?: string | null;
  checkoutSessionId?: string | null;
}

export interface SearchPostsInput {
  query?: string;
  categories?: string[];
  createdAt?: { from?: string; to?: string };
  readingTime?: { min?: number; max?: number };
  cursor?: string;
  limit?: number;
}

export interface SearchPostsResult {
  items: PostEntity[];
  nextCursor?: string | null;
}

export interface SearchUsersInput {
  query?: string;
  useMyLocation?: boolean;
  radiusKm?: number;
  cursor?: string;
  limit?: number;
}

export interface SearchUsersResult {
  items: UserEntity[];
  nextCursor?: string | null;
}

export interface CommentsPerPostStat {
  postId: string;
  postTitle: string;
  count: number;
}

export interface CommentsPerUserStat {
  userId: string;
  userName: string;
  count: number;
}

export interface CommentsPerPeriodStat {
  period: string;
  count: number;
}

export interface RatingDistributionStat {
  rating: number;
  count: number;
}

export interface DateCountPoint {
  date: string;
  count: number;
}

export interface RoleBreakdownPoint {
  role: string;
  online: number;
  offline: number;
}

export interface TermCount {
  term: string;
  count: number;
}

export interface GeoCluster {
  geohash: string;
  latitude: number;
  longitude: number;
  count: number;
}

export interface TopRatedPost {
  postId: string;
  postTitle: string;
  averageRating: number;
  ratingCount: number;
}

export interface CommentVelocityPoint {
  date: string;
  count: number;
  dailyChange: number;
}

export interface CommenterSentiment {
  userId: string;
  userName: string;
  positiveCount: number;
  criticalCount: number;
}

export interface SignificantTerm {
  term: string;
  score: number;
  docCount: number;
}

export interface AnalyticsDashboard {
  userGrowth: DateCountPoint[];
  roleBreakdown: RoleBreakdownPoint[];
  topCities: TermCount[];
  geoClusters: GeoCluster[];
  topRatedPosts: TopRatedPost[];
  commentVelocity: CommentVelocityPoint[];
  commenterSentiment: CommenterSentiment[];
  negativeCommentTerms: SignificantTerm[];
}
