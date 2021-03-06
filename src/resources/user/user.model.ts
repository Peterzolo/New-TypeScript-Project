import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
import User from '@/resources/user/user.interface';

const UserSchema = new Schema(
    {
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        password: {
            type: String,
        },
        post: [
            {
                type: Schema.Types.ObjectId,
                ref: 'post',
                default: [],
            },
        ],

        
        // Those users who add your ID to their accoun


        followers: [
            {
                type: Schema.Types.ObjectId,
                ref: 'user',
                default: [],
            },
        ], 

        //Those whose IDs you add to your account.

        followings: [
            {
                type: Schema.Types.ObjectId,
                ref: 'user',
                default: [],
            },
        ],

        
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
        },
    },
    { timestamps: true }
);

UserSchema.pre<User>('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    const hash = await bcrypt.hash(this.password, 10);

    this.password = hash;

    next();
});

UserSchema.methods.isValidPassword = async function (
    password: string
): Promise<Error | boolean> {
    return await bcrypt.compare(password, this.password);
};

export default model<User>('User', UserSchema);
