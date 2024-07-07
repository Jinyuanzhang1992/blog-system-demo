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
exports.CommentResolver = void 0;
const type_graphql_1 = require("type-graphql");
const Comment_1 = require("../schemas/Comment");
const pubSub_1 = require("../pubSub");
const database_1 = __importDefault(require("../database"));
let CommentResolver = class CommentResolver {
    async getComments() {
        const client = await database_1.default.connect();
        try {
            const res = await client.query(`
          SELECT c.c_id, c.content, c.post, c.author, u.name as author_name, u.email as author_email, p.title as post_title, p.content as post_content
          FROM comments c
          JOIN users u ON c.author = u.u_id
          JOIN posts p ON c.post = p.p_id
        `);
            const comments = res.rows.map((row) => ({
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
        }
        finally {
            client.release();
        }
    }
    async addComment(content, postId, authorId) {
        const client = await database_1.default.connect();
        try {
            const postRes = await client.query("SELECT p_id, title, content, author FROM posts WHERE p_id = $1", [postId]);
            const post = postRes.rows[0];
            if (!post) {
                throw new Error("Post not Found");
            }
            const authorRes = await client.query("SELECT u_id, name, email FROM users WHERE u_id = $1", [authorId]);
            const author = authorRes.rows[0];
            if (!author) {
                throw new Error("User not Found");
            }
            const res = await client.query("INSERT INTO comments (content, post, author) VALUES ($1, $2, $3) RETURNING *", [content, postId, authorId]);
            const newComment = res.rows[0];
            const fullPostAuthorRes = await client.query("SELECT u_id, name, email FROM users WHERE u_id = $1", [post.author]);
            const fullPostAuthor = fullPostAuthorRes.rows[0];
            pubSub_1.pubSub.publish("COMMENT_ADDED", {
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
        }
        finally {
            client.release();
        }
    }
    async deleteComment(id) {
        const client = await database_1.default.connect();
        try {
            const res = await client.query("DELETE FROM comments WHERE c_id = $1 RETURNING *", [id]);
            if (res.rows.length === 0) {
                throw new Error("Comment not found");
            }
            const deletedComment = res.rows[0];
            const postRes = await client.query("SELECT p_id, title, content, author FROM posts WHERE p_id = $1", [deletedComment.post]);
            const post = postRes.rows[0];
            const authorRes = await client.query("SELECT u_id, name, email FROM users WHERE u_id = $1", [deletedComment.author]);
            const author = authorRes.rows[0];
            const fullPostAuthorRes = await client.query("SELECT u_id, name, email FROM users WHERE u_id = $1", [post.author]);
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
        }
        finally {
            client.release();
        }
    }
    async updateComment(id, content, postId, authorId) {
        const client = await database_1.default.connect();
        try {
            const res = await client.query(`UPDATE comments SET content = COALESCE($1, content), post = COALESCE($2, post), author = COALESCE($3, author) WHERE c_id = $4 RETURNING *`, [content, postId, authorId, id]);
            if (res.rows.length === 0) {
                throw new Error("Comment not found");
            }
            const updatedComment = res.rows[0];
            const postRes = await client.query("SELECT p_id, title, content, author FROM posts WHERE p_id = $1", [updatedComment.post]);
            const post = postRes.rows[0];
            const authorRes = await client.query("SELECT u_id, name, email FROM users WHERE u_id = $1", [updatedComment.author]);
            const author = authorRes.rows[0];
            const fullPostAuthorRes = await client.query("SELECT u_id, name, email FROM users WHERE u_id = $1", [post.author]);
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
        }
        finally {
            client.release();
        }
    }
    newComment(commentPayload) {
        return commentPayload;
    }
};
exports.CommentResolver = CommentResolver;
__decorate([
    (0, type_graphql_1.Query)(() => [Comment_1.Comment]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CommentResolver.prototype, "getComments", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Comment_1.Comment),
    __param(0, (0, type_graphql_1.Arg)("content")),
    __param(1, (0, type_graphql_1.Arg)("post")),
    __param(2, (0, type_graphql_1.Arg)("author")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], CommentResolver.prototype, "addComment", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Comment_1.Comment),
    __param(0, (0, type_graphql_1.Arg)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CommentResolver.prototype, "deleteComment", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Comment_1.Comment),
    __param(0, (0, type_graphql_1.Arg)("id")),
    __param(1, (0, type_graphql_1.Arg)("content", { nullable: true })),
    __param(2, (0, type_graphql_1.Arg)("post", { nullable: true })),
    __param(3, (0, type_graphql_1.Arg)("author", { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], CommentResolver.prototype, "updateComment", null);
__decorate([
    (0, type_graphql_1.Subscription)(() => Comment_1.Comment, {
        topics: "COMMENT_ADDED",
    }),
    __param(0, (0, type_graphql_1.Root)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Comment_1.Comment]),
    __metadata("design:returntype", Comment_1.Comment)
], CommentResolver.prototype, "newComment", null);
exports.CommentResolver = CommentResolver = __decorate([
    (0, type_graphql_1.Resolver)(() => Comment_1.Comment)
], CommentResolver);
