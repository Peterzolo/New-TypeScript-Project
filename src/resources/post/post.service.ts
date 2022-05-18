import PostModel from '@/resources/post/post.model';
import Post from '@/resources/post/post.interface';

export class PostService {
    private post = PostModel;

    /**
     * Create a new post
     */
    
     public async findPostById(id : string) {
        try {
            const post = await this.post.findById({_id: id, status: 'active' });
            return post;
        } catch (error) {
            throw new Error('Could not fetch posts');
        }
    }


    public async create(
        title: string,
        description: string,
        body: string,
        image:string,
        author: object,
        status: string
    ): Promise<string | {} | Error> {
        try {
            const postExist = await this.post.findOne({ title });

            if (postExist) {
                throw new Error(
                    'Post with this title already exists ... try again using a different title'
                );
            }

            const post = await this.post.create({
                title,
                description,
                body,
                author,
                image,
                status,
            });
            return {
                title,
                description,
                body,
                author,
                image,
                status,
            };
        } catch (error) {
            throw new Error(error.message);  
        }
    }

    public async getPosts() {
        try {
            const allPosts = await this.post.find({ status: 'active' })
            return allPosts;
        } catch (error) {
            throw new Error('Could not fetch posts');
        }
    }

    public async getPost(id : string) {
        try {
            const post = await this.post.findById({_id: id, status: 'active' });
            return post;
        } catch (error) {
            throw new Error('Could not fetch posts');
        }
    }


    public async editPost(id: {}, userId: {}, editObj: {}) {
        try {
            const post = await this.post
                .findByIdAndUpdate(
                    { _id: id, user: userId },
                    { $set: editObj },
                    { new: true }
                );
            return post;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    public async removePost(id: {}, userId: {}) {
        try {
            const post = await this.post
                .findByIdAndUpdate(
                    { _id: id, user: userId },
                    { $set: {status : "inactive"} },
                    { new: true }
                );
            return post;
        } catch (error) {
            throw new Error(error.message);
        }
    }
}
   




export default PostService;
