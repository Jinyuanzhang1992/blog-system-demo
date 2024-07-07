export interface Post {
  p_id: string;
  title: string;
  content: string;
}

export interface User {
  u_id: string;
  name: string;
  email: string;
  posts: Post | null;
}
