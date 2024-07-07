import { ObjectType, ID, Field } from "type-graphql";
import { User } from "./User";
import { Post } from "./Post";

@ObjectType()
export class Comment {
  @Field(() => ID)
  c_id!: string;

  @Field()
  content!: string;

  @Field(() => Post, { nullable: true })
  post?: Post | null;

  @Field(() => User)
  author?: User;
}
