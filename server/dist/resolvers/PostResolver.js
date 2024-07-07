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
exports.PostResolver = void 0;
const type_graphql_1 = require("type-graphql");
const Post_1 = require("../schemas/Post");
const pubSub_1 = require("../pubSub");
const database_1 = __importDefault(require("../database"));
let PostResolver = class PostResolver {
    async getPosts() {
        const client = await database_1.default.connect();
        try {
            const res = await client.query(`
        SELECT p.p_id, p.title, p.content, u.u_id, u.name, u.email, c.c_id AS comment_id, c.content AS comment_content, c.author AS comment_author
        FROM posts p
        JOIN users u ON p.author = u.u_id
        LEFT JOIN comments c ON p.comment = c.c_id
      `);
            const posts = await Promise.all(res.rows.map(async (row) => {
                let comment = null;
                if (row.comment_id) {
                    const authorRes = await client.query("SELECT u_id, name, email FROM users WHERE u_id = $1", [row.comment_author]);
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
            }));
            return posts;
        }
        finally {
            client.release();
        }
    }
    async addPost(title, content, authorId) {
        const client = await database_1.default.connect();
        try {
            const userRes = await client.query("SELECT u_id, name, email FROM users WHERE u_id = $1", [authorId]);
            const author = userRes.rows[0];
            if (!author) {
                throw new Error("Author not found");
            }
            const res = await client.query("INSERT INTO posts (title, content, author) VALUES ($1, $2, $3) RETURNING *", [title, content, authorId]);
            const newPost = res.rows[0];
            const fullPost = {
                ...newPost,
                author,
                comment: undefined,
            };
            // 发布 POST_ADDED 事件
            pubSub_1.pubSub.publish("POST_ADDED", fullPost);
            return fullPost;
        }
        finally {
            client.release();
        }
    }
    async deletePost(id) {
        const client = await database_1.default.connect();
        try {
            const res = await client.query("DELETE FROM posts WHERE p_id = $1 RETURNING *", [id]);
            if (res.rows.length === 0) {
                throw new Error("Post not found");
            }
            const deletedPost = res.rows[0];
            const authorRes = await client.query("SELECT u_id, name, email FROM users WHERE u_id = $1", [deletedPost.author]);
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
            pubSub_1.pubSub.publish("POST_DELETED", fullDeletedPost);
            return fullDeletedPost;
        }
        finally {
            client.release();
        }
    }
    async updatePost(id, title, content, authorId, commentId) {
        const client = await database_1.default.connect();
        try {
            const res = await client.query(`UPDATE posts SET title = COALESCE($1, title), content = COALESCE($2, content), author = COALESCE($3, author), comment = COALESCE($4, comment) WHERE p_id = $5 RETURNING *`, [title, content, authorId, commentId, id]);
            if (res.rows.length === 0) {
                throw new Error("Post not found");
            }
            const updatedPost = res.rows[0];
            const commentRes = await client.query("SELECT c.c_id, c.content, u.u_id, u.name, u.email FROM comments c JOIN users u ON c.author = u.u_id WHERE c.c_id = $1", [commentId]);
            const comment = commentRes.rows[0];
            const authorRes = await client.query("SELECT u_id, name, email FROM users WHERE u_id = $1", [updatedPost.author]);
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
            pubSub_1.pubSub.publish("POST_UPDATED", fullUpdatedPost);
            return fullUpdatedPost;
        }
        finally {
            client.release();
        }
    }
    newPost(postPayload) {
        console.log("开始Post添加订阅");
        return postPayload;
    }
    deletedPost(postPayload) {
        console.log("开始Post删除订阅");
        return postPayload;
    }
    updatedPost(postPayload) {
        console.log("开始Post更新订阅");
        return postPayload;
    }
};
exports.PostResolver = PostResolver;
__decorate([
    (0, type_graphql_1.Query)(() => [Post_1.Post]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "getPosts", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Post_1.Post),
    __param(0, (0, type_graphql_1.Arg)("title")),
    __param(1, (0, type_graphql_1.Arg)("content")),
    __param(2, (0, type_graphql_1.Arg)("author")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "addPost", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Post_1.Post),
    __param(0, (0, type_graphql_1.Arg)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "deletePost", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Post_1.Post),
    __param(0, (0, type_graphql_1.Arg)("id")),
    __param(1, (0, type_graphql_1.Arg)("title", { nullable: true })),
    __param(2, (0, type_graphql_1.Arg)("content", { nullable: true })),
    __param(3, (0, type_graphql_1.Arg)("author", { nullable: true })),
    __param(4, (0, type_graphql_1.Arg)("comment", { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "updatePost", null);
__decorate([
    (0, type_graphql_1.Subscription)(() => Post_1.Post, {
        topics: "POST_ADDED",
    }),
    __param(0, (0, type_graphql_1.Root)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Post_1.Post]),
    __metadata("design:returntype", Post_1.Post)
], PostResolver.prototype, "newPost", null);
__decorate([
    (0, type_graphql_1.Subscription)(() => Post_1.Post, {
        topics: "POST_DELETED",
    }),
    __param(0, (0, type_graphql_1.Root)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Post_1.Post]),
    __metadata("design:returntype", Post_1.Post)
], PostResolver.prototype, "deletedPost", null);
__decorate([
    (0, type_graphql_1.Subscription)(() => Post_1.Post, {
        topics: "POST_UPDATED",
    }),
    __param(0, (0, type_graphql_1.Root)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Post_1.Post]),
    __metadata("design:returntype", Post_1.Post)
], PostResolver.prototype, "updatedPost", null);
exports.PostResolver = PostResolver = __decorate([
    (0, type_graphql_1.Resolver)(() => Post_1.Post)
], PostResolver);
