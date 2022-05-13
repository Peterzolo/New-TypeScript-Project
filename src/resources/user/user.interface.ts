import { Document } from 'mongoose';

export default interface User extends Document {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    followers? :Array<object>;
    followings? :Array<object>;
    posts?:Array<object>;
    role: string;
    status:string;

    isValidPassword(password: string): Promise<Error | boolean>;
}
