import { Router, Request, Response, NextFunction } from 'express';
import Controller from '@/utils/interfaces/controller.interface';
import HttpException from '@/utils/exceptions/http.exception';
import validationMiddleware from '@/middleware/validation.middleware';
import validate from '@/resources/post/post.validation';
import authenticated from '@/middleware/authenticated.middleware';
import { PostService } from '@/resources/post/post.service';

class PostController implements Controller {
    public path = `/post`;
    public router = Router();
    private PostService = new PostService();

    constructor() {
        this.initialiseRoutes();
    }

    private initialiseRoutes(): void {
        this.router.post(
            `${this.path}/create`,
            authenticated,
            validationMiddleware(validate.create),
            this.create
        );
        this.router.get(`${this.path}/fetch-all`, this.getAllPosts);
        this.router.get(`${this.path}/fetch-one/:id`, this.getPost);
    }

    private create = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const { title, description, body, author, status } = req.body;

            const userId = req.user._id;
            const bodyAuthor = req.body.author;

            if (req.body.author !== userId.toString()) {
                throw new Error(
                    'Sorry you are not allowed to create this post'
                );
            }

            const post = await this.PostService.create(
                title,
                description,
                body,
                author,
                status
            );

            res.status(201).json({
                success: true,
                message: 'Post successfully created',
                content: post,
            });
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private getAllPosts = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const allPosts = await this.PostService.getPosts();
            res.status(201).json({ success: allPosts });
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };
    private getPost = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const {id} =req.params
            const posts = await this.PostService.getPost(id);
            res.status(201).json({ success: posts });
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };
}

export default PostController;
