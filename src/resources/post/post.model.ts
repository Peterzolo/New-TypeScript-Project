import { Schema, model } from 'mongoose';
import Post from '@/resources/post/post.interface';

const PostSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        body: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            default: 'https://unsplash.com/photos/DuHKoV44prg',
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            required: true,
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
        },
    },
    { timestamps: true }
);

export default model<Post>('Post', PostSchema);
