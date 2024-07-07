"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResolver = void 0;
const type_graphql_1 = require("type-graphql");
const User_1 = require("../schemas/User");
const pubSub_1 = require("../pubSub");
const database_1 = __importDefault(require("../database"));
let UserResolver = class UserResolver {
    async getUsers() {
        const client = await database_1.default.connect();
        try {
            const res = await client.query(`
        SELECT u.u_id, u.name, u.email, p.p_id AS post_id, p.title AS post_title, p.content AS post_content, p.comment
        FROM users u
        LEFT JOIN posts p ON u.posts = p.p_id
      `);
            const users = await Promise.all(res.rows.map(async (row) => {
                let comment = null;
                if (row.comment) {
                    const commentRes = await client.query("SELECT c.c_id, c.content, u.u_id, u.name, u.email FROM comments c JOIN users u ON c.author = u.u_id WHERE c.c_id = $1", [row.comment]);
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
            }));
            return users;
        }
        catch (err) {
            throw new Error("Failed to fetch users");
        }
        finally {
            client.release();
        }
    }
    async addUser(name, email) {
        const client = await database_1.default.connect();
        try {
            const res = await client.query("INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *", [name, email]);
            const newUser = res.rows[0];
            pubSub_1.pubSub.publish("USER_ADDED", newUser);
            return newUser;
        }
        catch (err) {
            console.error("Error adding user: ", err);
            throw new Error("Failed to add user");
        }
        finally {
            client.release();
        }
    }
    async deleteUser(id) {
        const client = await database_1.default.connect();
        try {
            const res = await client.query("DELETE FROM users WHERE u_id = $1 RETURNING *", [id]);
            if (res.rows.length === 0) {
                throw new Error("User not found");
            }
            const deletedUser = res.rows[0];
            pubSub_1.pubSub.publish("USER_DELETED", deletedUser);
            return deletedUser;
        }
        finally {
            client.release();
        }
    }
    async updateUser(id, name, email, posts) {
        const client = await database_1.default.connect();
        try {
            const res = await client.query(`UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email), posts = COALESCE($3, posts) WHERE u_id = $4 RETURNING *`, [name, email, posts, id]);
            if (res.rows.length === 0) {
                throw new Error("User not found");
            }
            const updatedUser = res.rows[0];
            let post = null;
            if (posts) {
                const postRes = await client.query("SELECT p.p_id, p.title, p.content, u.u_id, u.name, u.email FROM posts p JOIN users u ON p.author = u.u_id WHERE p.p_id = $1", [posts]);
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
            pubSub_1.pubSub.publish("USER_UPDATED", fullUpdatedUser);
            return fullUpdatedUser;
        }
        catch (err) {
            throw new Error("Failed to update user");
        }
        finally {
            client.release();
        }
    }
    newUser(userPayload) {
        console.log("开始用户添加订阅");
        return userPayload;
    }
    updatedUser(userPayload) {
        console.log("开始用户更新订阅");
        return userPayload;
    }
    deletedUser(userPayload) {
        console.log("开始用户删除订阅");
        return userPayload;
    }
};
exports.UserResolver = UserResolver;
__decorate([
    (0, type_graphql_1.Query)(() => [User_1.User]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "getUsers", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => User_1.User),
    __param(0, (0, type_graphql_1.Arg)("name")),
    __param(1, (0, type_graphql_1.Arg)("email")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "addUser", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => User_1.User),
    __param(0, (0, type_graphql_1.Arg)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "deleteUser", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => User_1.User),
    __param(0, (0, type_graphql_1.Arg)("id")),
    __param(1, (0, type_graphql_1.Arg)("name", { nullable: true })),
    __param(2, (0, type_graphql_1.Arg)("email", { nullable: true })),
    __param(3, (0, type_graphql_1.Arg)("posts", { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Number]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "updateUser", null);
__decorate([
    (0, type_graphql_1.Subscription)(() => User_1.User, {
        topics: "USER_ADDED",
    }),
    __param(0, (0, type_graphql_1.Root)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [User_1.User]),
    __metadata("design:returntype", User_1.User)
], UserResolver.prototype, "newUser", null);
__decorate([
    (0, type_graphql_1.Subscription)(() => User_1.User, {
        topics: "USER_UPDATED",
    }),
    __param(0, (0, type_graphql_1.Root)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [User_1.User]),
    __metadata("design:returntype", User_1.User)
], UserResolver.prototype, "updatedUser", null);
__decorate([
    (0, type_graphql_1.Subscription)(() => User_1.User, {
        topics: "USER_DELETED",
    }),
    __param(0, (0, type_graphql_1.Root)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [User_1.User]),
    __metadata("design:returntype", User_1.User)
], UserResolver.prototype, "deletedUser", null);
exports.UserResolver = UserResolver = __decorate([
    (0, type_graphql_1.Resolver)(() => User_1.User)
], UserResolver);
