import PostModel from '@/resources/post/post.model';
import Post from '@/resources/post/post.interface';


export class PostService {
    private post = PostModel;
    
    /**
     * Create a new post
     */
    public async create(title: string, body: string): Promise<Post> {
        try {
            const post = await this.post.create({ title, body });

            return post;
        } catch (error) {
            throw new Error('Unable to create post');
        }
    }


    public async getPost(){
        try {
            const allPosts = await this.post.find();
            return allPosts
        } catch (error) {
            throw new Error('Could not fetch posts')
        }
    }

}

// gamesRouter.get("/", async (_req: Request, res: Response) => {
//     try {
//        const games = (await collections.games.find({}).toArray()) as Game[];

//         res.status(200).send(games);
//     } catch (error) {
//         res.status(500).send(error.message);
//     }
// });

// export default PostService;
