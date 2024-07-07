import {
  Resolver,
  Query,
  Mutation,
  Arg,
  Subscription,
  Root,
} from "type-graphql";
import { User } from "../schemas/User";
import { pubSub } from "../pubSub";
import pool from "../database";

@Resolver(() => User)
export class UserResolver {
  @Query(() => [User])
  async getUsers(): Promise<User[]> {
    const client = await pool.connect();
    try {
      const res = await client.query(`
        SELECT u.u_id, u.name, u.email, p.p_id AS post_id, p.title AS post_title, p.content AS post_content, p.comment
        FROM users u
        LEFT JOIN posts p ON u.posts = p.p_id
      `);

      const users: User[] = await Promise.all(
        res.rows.map(async (row) => {
          let comment = null;
          if (row.comment) {
            const commentRes = await client.query(
              "SELECT c.c_id, c.content, u.u_id, u.name, u.email FROM comments c JOIN users u ON c.author = u.u_id WHERE c.c_id = $1",
              [row.comment]
            );
            const commentRow = commentRes.rows[0];
            comment = commentRow
              ? {
                  c_id: commentRow.c_id,
                  content: commentRow.content,
                  post: null,
                  author: {
                    u_id: commentRow.u_id,
                    name: commentRow.name,
                    email: commentRow.email,
                  },
                }
              : undefined;
          }

          return {
            u_id: row.u_id,
            name: row.name,
            email: row.email,
            posts: row.post_id
              ? {
                  p_id: row.post_id,
                  title: row.post_title,
                  content: row.post_content,
                  author: { u_id: row.u_id, name: row.name, email: row.email },
                  comment: comment,
                }
              : null,
          };
        })
      );

      return users;
    } catch (err) {
      throw new Error("Failed to fetch users");
    } finally {
      client.release();
    }
  }

  @Mutation(() => User)
  async addUser(
    @Arg("name") name: string,
    @Arg("email") email: string
  ): Promise<User> {
    const client = await pool.connect();
    try {
      const res = await client.query(
        "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
        [name, email]
      );
      const newUser = res.rows[0];
      pubSub.publish("USER_ADDED", newUser);
      return newUser;
    } catch (err) {
      console.error("Error adding user: ", err);
      throw new Error("Failed to add user");
    } finally {
      client.release();
    }
  }

  @Mutation(() => User)
  async deleteUser(@Arg("id") id: string): Promise<User> {
    const client = await pool.connect();
    try {
      const res = await client.query(
        "DELETE FROM users WHERE u_id = $1 RETURNING *",
        [id]
      );
      if (res.rows.length === 0) {
        throw new Error("User not found");
      }
      const deletedUser = res.rows[0];
      pubSub.publish("USER_DELETED", deletedUser);
      return deletedUser;
    } finally {
      client.release();
    }
  }

  @Mutation(() => User)
  async updateUser(
    @Arg("id") id: string,
    @Arg("name", { nullable: true }) name?: string,
    @Arg("email", { nullable: true }) email?: string,
    @Arg("posts", { nullable: true }) posts?: number
  ): Promise<User> {
    const client = await pool.connect();
    try {
      const res = await client.query(
        `UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email), posts = COALESCE($3, posts) WHERE u_id = $4 RETURNING *`,
        [name, email, posts, id]
      );

      if (res.rows.length === 0) {
        throw new Error("User not found");
      }

      const updatedUser = res.rows[0];

      let post = null;
      if (posts) {
        const postRes = await client.query(
          "SELECT p.p_id, p.title, p.content, u.u_id, u.name, u.email FROM posts p JOIN users u ON p.author = u.u_id WHERE p.p_id = $1",
          [posts]
        );
        const postRow = postRes.rows[0];
        post = postRow
          ? {
              p_id: postRow.p_id,
              title: postRow.title,
              content: postRow.content,
              author: {
                u_id: postRow.u_id,
                name: postRow.name,
                email: postRow.email,
              },
              comments: [],
            }
          : null;
      }

      const fullUpdatedUser = {
        ...updatedUser,
        posts: post,
      };

      pubSub.publish("USER_UPDATED", fullUpdatedUser);

      return fullUpdatedUser;
    } catch (err) {
      throw new Error("Failed to update user");
    } finally {
      client.release();
    }
  }

  @Subscription(() => User, {
    topics: "USER_ADDED",
  })
  newUser(@Root() userPayload: User): User {
    console.log("开始用户添加订阅");
    return userPayload;
  }

  @Subscription(() => User, {
    topics: "USER_UPDATED",
  })
  updatedUser(@Root() userPayload: User): User {
    console.log("开始用户更新订阅");
    return userPayload;
  }

  @Subscription(() => User, {
    topics: "USER_DELETED",
  })
  deletedUser(@Root() userPayload: User): User {
    console.log("开始用户删除订阅");
    return userPayload;
  }
}
