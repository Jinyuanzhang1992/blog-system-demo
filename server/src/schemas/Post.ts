import { ObjectType, ID, Field } from "type-graphql";
import { User } from "./User";
import { Comment } from "./Comment";

@ObjectType()
export class Post {
  @Field(() => ID)
  p_id!: string;

  @Field()
  title!: string;

  @Field()
  content!: string;

  @Field(() => User)
  author!: User;

  @Field(() => Comment, { nullable: true })
  comment?: Comment | null;
}
