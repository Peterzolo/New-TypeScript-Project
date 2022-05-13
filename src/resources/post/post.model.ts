import { Schema, model } from 'mongoose';
import Post from '@/resources/post/post.interface';

const PostSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        body: {
            type: String,
            required: true,
        },
        author:{
            type : Schema.Types.ObjectId,
            ref : 'user'
        }
    },
    { timestamps: true }
);

export default model<Post>('Post', PostSchema);
