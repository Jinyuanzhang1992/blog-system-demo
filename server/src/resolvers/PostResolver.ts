import {
  Resolver,
  Query,
  Mutation,
  Arg,
  Subscription,
  Root,
} from "type-graphql";
import { Post } from "../schemas/Post";
import { User } from "../schemas/User";
import { Comment } from "../schemas/Comment";
import { pubSub } from "../pubSub";
import pool from "../database";

@Resolver(() => Post)
export class PostResolver {
  @Query(() => [Post])
  async getPosts(): Promise<Post[]> {
    const client = await pool.connect();
    try {
      const res = await client.query(`
        SELECT p.p_id, p.title, p.content, u.u_id, u.name, u.email, c.c_id AS comment_id, c.content AS comment_content, c.author AS comment_author
        FROM posts p
        JOIN users u ON p.author = u.u_id
        LEFT JOIN comments c ON p.comment = c.c_id
      `);

      const posts: Post[] = await Promise.all(
        res.rows.map(async (row) => {
          let comment = null;
          if (row.comment_id) {
            const authorRes = await client.query(
              "SELECT u_id, name, email FROM users WHERE u_id = $1",
              [row.comment_author]
            );
            const author = authorRes.rows[0];
            comment = {
              c_id: row.comment_id,
              content: row.comment_content,
              post: {
                p_id: row.p_id,
                title: row.title,
                content: row.content,
                author: {
                  u_id: row.u_id,
                  name: row.name,
                  email: row.email,
                },
              },
              author: {
                u_id: author.u_id,
                name: author.name,
                email: author.email,
              },
            };
          }

          return {
            p_id: row.p_id,
            title: row.title,
            content: row.content,
            author: {
              u_id: row.u_id,
              name: row.name,
              email: row.email,
            },
            comment,
          };
        })
      );

      return posts;
    } finally {
      client.release();
    }
  }

  @Mutation(() => Post)
  async addPost(
    @Arg("title") title: string,
    @Arg("content") content: string,
    @Arg("author") authorId: string
  ): Promise<Post> {
    const client = await pool.connect();
    try {
      const userRes = await client.query(
        "SELECT u_id, name, email FROM users WHERE u_id = $1",
        [authorId]
      );
      const author = userRes.rows[0];

      if (!author) {
        throw new Error("Author not found");
      }
      const res = await client.query(
        "INSERT INTO posts (title, content, author) VALUES ($1, $2, $3) RETURNING *",
        [title, content, authorId]
      );
      const newPost = res.rows[0];
      const fullPost = {
        ...newPost,
        author,
        comment: undefined,
      };

      // 发布 POST_ADDED 事件
      pubSub.publish("POST_ADDED", fullPost);

      return fullPost;
    } finally {
      client.release();
    }
  }

  @Mutation(() => Post)
  async deletePost(@Arg("id") id: string): Promise<Post> {
    const client = await pool.connect();
    try {
      const res = await client.query(
        "DELETE FROM posts WHERE p_id = $1 RETURNING *",
        [id]
      );
      if (res.rows.length === 0) {
        throw new Error("Post not found");
      }

      const deletedPost = res.rows[0];

      const authorRes = await client.query(
        "SELECT u_id, name, email FROM users WHERE u_id = $1",
        [deletedPost.author]
      );
      const author = authorRes.rows[0];

      const fullDeletedPost = {
        ...deletedPost,
        author: {
          u_id: author.u_id,
          name: author.name,
          email: author.email,
        },
        comment: deletedPost.comment
          ? {
              c_id: deletedPost.comment,
              content: "Dummy Content",
              post: null,
              author: null,
            }
          : undefined,
      };

      // 发布 POST_DELETED 事件
      pubSub.publish("POST_DELETED", fullDeletedPost);

      return fullDeletedPost;
    } finally {
      client.release();
    }
  }

  @Mutation(() => Post)
  async updatePost(
    @Arg("id") id: string,
    @Arg("title", { nullable: true }) title?: string,
    @Arg("content", { nullable: true }) content?: string,
    @Arg("author", { nullable: true }) authorId?: string,
    @Arg("comment", { nullable: true }) commentId?: string
  ): Promise<Post> {
    const client = await pool.connect();
    try {
      const res = await client.query(
        `UPDATE posts SET title = COALESCE($1, title), content = COALESCE($2, content), author = COALESCE($3, author), comment = COALESCE($4, comment) WHERE p_id = $5 RETURNING *`,
        [title, content, authorId, commentId, id]
      );

      if (res.rows.length === 0) {
        throw new Error("Post not found");
      }

      const updatedPost = res.rows[0];

      const commentRes = await client.query(
        "SELECT c.c_id, c.content, u.u_id, u.name, u.email FROM comments c JOIN users u ON c.author = u.u_id WHERE c.c_id = $1",
        [commentId]
      );

      const comment = commentRes.rows[0];

      const authorRes = await client.query(
        "SELECT u_id, name, email FROM users WHERE u_id = $1",
        [updatedPost.author]
      );
      const author = authorRes.rows[0];

      const fullUpdatedPost = {
        ...updatedPost,
        author: {
          u_id: author.u_id,
          name: author.name,
          email: author.email,
        },
        comment: comment
          ? {
              c_id: comment.c_id,
              content: comment.content,
              post: {
                p_id: updatedPost.p_id,
                title: updatedPost.title,
                content: updatedPost.content,
                author: {
                  u_id: author.u_id,
                  name: author.name,
                  email: author.email,
                },
              },
              author: {
                u_id: comment.u_id,
                name: comment.name,
                email: comment.email,
              },
            }
          : undefined,
      };

      // 发布 POST_UPDATED 事件
      pubSub.publish("POST_UPDATED", fullUpdatedPost);

      return fullUpdatedPost;
    } finally {
      client.release();
    }
  }

  @Subscription(() => Post, {
    topics: "POST_ADDED",
  })
  newPost(@Root() postPayload: Post): Post {
    console.log("开始Post添加订阅");
    return postPayload;
  }

  @Subscription(() => Post, {
    topics: "POST_DELETED",
  })
  deletedPost(@Root() postPayload: Post): Post {
    console.log("开始Post删除订阅");
    return postPayload;
  }

  @Subscription(() => Post, {
    topics: "POST_UPDATED",
  })
  updatedPost(@Root() postPayload: Post): Post {
    console.log("开始Post更新订阅");
    return postPayload;
  }
}
