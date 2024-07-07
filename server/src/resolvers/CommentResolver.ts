import {
  Query,
  Resolver,
  Mutation,
  Arg,
  Subscription,
  Root,
} from "type-graphql";
import { Comment } from "../schemas/Comment";
import { pubSub } from "../pubSub";
import pool from "../database";

@Resolver(() => Comment)
export class CommentResolver {
  @Query(() => [Comment])
  async getComments(): Promise<Comment[]> {
    const client = await pool.connect();
    try {
      const res = await client.query(`
          SELECT c.c_id, c.content, c.post, c.author, u.name as author_name, u.email as author_email, p.title as post_title, p.content as post_content
          FROM comments c
          JOIN users u ON c.author = u.u_id
          JOIN posts p ON c.post = p.p_id
        `);

      const comments: Comment[] = res.rows.map((row) => ({
        c_id: row.c_id,
        content: row.content,
        post: {
          p_id: row.post,
          title: row.post_title,
          content: row.post_content,
          author: {
            u_id: row.author,
            name: row.author_name,
            email: row.author_email,
          },
        },
        author: {
          u_id: row.author,
          name: row.author_name,
          email: row.author_email,
        },
      }));

      return comments;
    } finally {
      client.release();
    }
  }

  @Mutation(() => Comment)
  async addComment(
    @Arg("content") content: string,
    @Arg("post") postId: string,
    @Arg("author") authorId: string
  ): Promise<Comment> {
    const client = await pool.connect();
    try {
      const postRes = await client.query(
        "SELECT p_id, title, content, author FROM posts WHERE p_id = $1",
        [postId]
      );
      const post = postRes.rows[0];
      if (!post) {
        throw new Error("Post not Found");
      }

      const authorRes = await client.query(
        "SELECT u_id, name, email FROM users WHERE u_id = $1",
        [authorId]
      );
      const author = authorRes.rows[0];
      if (!author) {
        throw new Error("User not Found");
      }

      const res = await client.query(
        "INSERT INTO comments (content, post, author) VALUES ($1, $2, $3) RETURNING *",
        [content, postId, authorId]
      );
      const newComment = res.rows[0];

      const fullPostAuthorRes = await client.query(
        "SELECT u_id, name, email FROM users WHERE u_id = $1",
        [post.author]
      );
      const fullPostAuthor = fullPostAuthorRes.rows[0];

      pubSub.publish("COMMENT_ADDED", {
        ...newComment,
        post: {
          ...post,
          author: {
            u_id: fullPostAuthor.u_id,
            name: fullPostAuthor.name,
            email: fullPostAuthor.email,
          },
        },
        author,
      });

      return {
        ...newComment,
        post: {
          ...post,
          author: {
            u_id: fullPostAuthor.u_id,
            name: fullPostAuthor.name,
            email: fullPostAuthor.email,
          },
        },
        author,
      };
    } finally {
      client.release();
    }
  }

  @Mutation(() => Comment)
  async deleteComment(@Arg("id") id: string): Promise<Comment> {
    const client = await pool.connect();
    try {
      const res = await client.query(
        "DELETE FROM comments WHERE c_id = $1 RETURNING *",
        [id]
      );
      if (res.rows.length === 0) {
        throw new Error("Comment not found");
      }
      const deletedComment = res.rows[0];

      const postRes = await client.query(
        "SELECT p_id, title, content, author FROM posts WHERE p_id = $1",
        [deletedComment.post]
      );
      const post = postRes.rows[0];

      const authorRes = await client.query(
        "SELECT u_id, name, email FROM users WHERE u_id = $1",
        [deletedComment.author]
      );
      const author = authorRes.rows[0];

      const fullPostAuthorRes = await client.query(
        "SELECT u_id, name, email FROM users WHERE u_id = $1",
        [post.author]
      );
      const fullPostAuthor = fullPostAuthorRes.rows[0];

      return {
        ...deletedComment,
        post: {
          ...post,
          author: {
            u_id: fullPostAuthor.u_id,
            name: fullPostAuthor.name,
            email: fullPostAuthor.email,
          },
        },
        author,
      };
    } finally {
      client.release();
    }
  }

  @Mutation(() => Comment)
  async updateComment(
    @Arg("id") id: string,
    @Arg("content", { nullable: true }) content?: string,
    @Arg("post", { nullable: true }) postId?: string,
    @Arg("author", { nullable: true }) authorId?: string
  ): Promise<Comment> {
    const client = await pool.connect();
    try {
      const res = await client.query(
        `UPDATE comments SET content = COALESCE($1, content), post = COALESCE($2, post), author = COALESCE($3, author) WHERE c_id = $4 RETURNING *`,
        [content, postId, authorId, id]
      );

      if (res.rows.length === 0) {
        throw new Error("Comment not found");
      }

      const updatedComment = res.rows[0];

      const postRes = await client.query(
        "SELECT p_id, title, content, author FROM posts WHERE p_id = $1",
        [updatedComment.post]
      );
      const post = postRes.rows[0];

      const authorRes = await client.query(
        "SELECT u_id, name, email FROM users WHERE u_id = $1",
        [updatedComment.author]
      );
      const author = authorRes.rows[0];

      const fullPostAuthorRes = await client.query(
        "SELECT u_id, name, email FROM users WHERE u_id = $1",
        [post.author]
      );
      const fullPostAuthor = fullPostAuthorRes.rows[0];

      return {
        ...updatedComment,
        post: {
          ...post,
          author: {
            u_id: fullPostAuthor.u_id,
            name: fullPostAuthor.name,
            email: fullPostAuthor.email,
          },
        },
        author,
      };
    } finally {
      client.release();
    }
  }

  @Subscription(() => Comment, {
    topics: "COMMENT_ADDED",
  })
  newComment(@Root() commentPayload: Comment): Comment {
    return commentPayload;
  }
}
