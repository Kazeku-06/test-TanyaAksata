// ============================================================
// Auth & User
// ============================================================

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  bio?: string | null;
  location?: string | null;
  website?: string | null;
  reputation: number;
  reputation_level?: string;
  is_banned: boolean;
  banned_until?: string | null;
  warning_count?: number;
  created_at: string;
  posts_count?: number;
  followers_count?: number;
  following_count?: number;
  badges?: Badge[];
  roles?: Role[];
}

export interface AuthData {
  user: User;
  token: string;
  token_type: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface UpdateProfilePayload {
  name?: string;
  bio?: string;
  location?: string;
  website?: string;
  avatar?: File;
  current_password?: string;
  new_password?: string;
  new_password_confirmation?: string;
}

// ============================================================
// Role & Badge
// ============================================================

export interface Role {
  id: string;
  name: string;
}

export interface Badge {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  achievement_type: string;
  threshold: number;
}

// ============================================================
// Category
// ============================================================

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parent_id?: string | null;
  sort_order?: number;
  children?: Category[];
  parent?: Category | null;
}

// ============================================================
// Tag
// ============================================================

export interface Tag {
  id: string;
  name: string;
  slug?: string;
}

// ============================================================
// Post
// ============================================================

export interface Post {
  id: string;
  title: string;
  body: string;
  user_id: string;
  category_id: string;
  votes_count: number;
  likes_count: number;
  comments_count: number;
  views_count: number;
  is_solved: boolean;
  is_edited: boolean;
  edit_count?: number;
  is_bookmarked?: boolean;
  bookmark_id?: string | null;
  user_vote?: 1 | -1 | null;
  is_liked?: boolean;
  accepted_answer_id?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  user: Pick<User, "id" | "name" | "avatar" | "reputation">;
  category: Pick<Category, "id" | "name" | "slug">;
  tags: Tag[];
  comments?: Comment[];
}

export interface CreatePostPayload {
  title: string;
  body: string;
  category_id: string;
  tags?: string[];
}

export interface UpdatePostPayload {
  title?: string;
  body?: string;
  category_id?: string;
  tags?: string[];
  edit_summary?: string;
}

export interface PostEditHistory {
  id: string;
  post_id: string;
  edited_by: string;
  title_before: string;
  title_after: string;
  body_before: string;
  body_after: string;
  edit_summary?: string | null;
  created_at: string;
  editor?: Pick<User, "id" | "name">;
}

// ============================================================
// Comment
// ============================================================

export interface Comment {
  id: string;
  post_id: string;
  parent_id?: string | null;
  body: string;
  votes_count: number;
  likes_count: number;
  is_accepted: boolean;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  user: Pick<User, "id" | "name" | "avatar" | "reputation">;
  replies?: Comment[];
}

export interface CreateCommentPayload {
  post_id: string;
  body: string;
  parent_id?: string;
}

export interface UpdateCommentPayload {
  body: string;
  edit_summary?: string;
}

export interface CommentEditHistory {
  id: string;
  comment_id: string;
  edited_by: string;
  body_before: string;
  body_after: string;
  edit_summary?: string | null;
  created_at: string;
}

// ============================================================
// Vote & Like
// ============================================================

export interface VotePayload {
  vote: 1 | -1;
}

export interface VoteResponse {
  votes_count: number;
  user_vote: 1 | -1 | null;
}

export interface LikeResponse {
  likes_count: number;
  is_liked: boolean;
}

// ============================================================
// Bookmark
// ============================================================

export interface Bookmark {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
  post: Post;
}

// ============================================================
// Follow
// ============================================================

export interface FollowStatus {
  is_following: boolean;
}

// ============================================================
// Notification
// ============================================================

export type NotificationType =
  | "comment"
  | "reply"
  | "vote"
  | "like"
  | "follow"
  | "accepted_answer"
  | "badge"
  | "warning"
  | "ban"
  | "unban";

export interface Notification {
  id: string;
  user_id: string;
  actor_id?: string | null;
  type: NotificationType;
  target_type?: string | null;
  target_id?: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

// ============================================================
// Report
// ============================================================

export type ReportTargetType = "post" | "comment" | "user";
export type ReportStatus = "pending" | "resolved" | "rejected";

export interface Report {
  id: string;
  reporter_id: string;
  target_type: string;
  target_id: string;
  reason: string;
  description?: string | null;
  status: ReportStatus;
  action_taken?: string | null;
  resolution_note?: string | null;
  resolved_by?: string | null;
  created_at: string;
  reporter?: Pick<User, "id" | "name">;
  resolver?: Pick<User, "id" | "name"> | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  target?: any;
}

export interface CreateReportPayload {
  target_type: ReportTargetType;
  target_id: string;
  reason: string;
  description?: string;
}

// ============================================================
// Leaderboard
// ============================================================

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatar?: string | null;
  reputation: number;
  posts_count: number;
  accepted_count: number;
  rank: number;
}

// ============================================================
// Admin Statistics
// ============================================================

export interface AdminStatistics {
  users: {
    total: number;
    new_this_week: number;
    banned: number;
  };
  posts: {
    total: number;
    published_this_week: number;
    solved: number;
    deleted: number;
  };
  comments: {
    total: number;
    this_week: number;
    deleted: number;
  };
  votes: {
    total: number;
    upvotes: number;
    downvotes: number;
  };
  likes: {
    total: number;
    this_week: number;
  };
  reports: {
    total: number;
    pending: number;
    resolved: number;
    rejected: number;
  };
  categories: {
    total: number;
  };
  engagement: {
    total_interactions: number;
    avg_comments_per_post: number;
    avg_votes_per_post: number;
  };
}

export interface ActivityTrend {
  date: string;
  posts: number;
  comments: number;
  users: number;
  votes: number;
  likes: number;
}

// ============================================================
// API Response wrappers
// ============================================================

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedData<T> {
  current_page: number;
  data: T[];
  per_page: number;
  total: number;
  last_page: number;
  next_page_url?: string | null;
  prev_page_url?: string | null;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// ============================================================
// Search
// ============================================================

export interface PostSearchParams {
  q?: string;
  category_id?: string;
  tag?: string;
  user_id?: string;
  username?: string;
  created_from?: string;
  created_to?: string;
  sort?: "latest" | "oldest" | "most_voted" | "most_commented";
  page?: number;
}
