import { ObjectType, Field, ID } from "type-graphql";
import { Post } from "./Post";

@ObjectType()
export class User {
  @Field(() => ID)
  u_id!: string; // 使用 '!' 来告诉 TypeScript 这个字段稍后会初始化

  @Field()
  name!: string;

  @Field()
  email!: string;

  @Field(() => Post, { nullable: true })
  posts?: Post | null;
}
