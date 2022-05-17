import { Router, Request, Response, NextFunction } from 'express';
import Controller from '@/utils/interfaces/controller.interface';
import HttpException from '@/utils/exceptions/http.exception';
import validationMiddleware from '@/middleware/validation.middleware';
import validate from '@/resources/post/post.validation';
import authenticated from '@/middleware/authenticated.middleware';
import { PostService } from '@/resources/post/post.service';
import Post from "@/resources/post/post.interface"

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
        this.router.put(`${this.path}/edit/:id`,authenticated, this.updatePost);
        this.router.delete(`${this.path}/remove/:id`,authenticated, this.deletePost);
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

            if (bodyAuthor !== userId.toString()) {
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
            res.status(201).json({
                PostCount: allPosts.length,
                success: true,
                Message: 'posts loaded',
                Content: allPosts,
            });
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
            const { id } = req.params;
            const post = await this.PostService.getPost(id);
            res.status(201).json({
                success: true,
                Message: 'post loaded',
                Content: post,
            });;
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private updatePost = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | number | string | {} | void> => {
        try {
            const userId = req.user;
            let { id } = req.params;
            let userObj = req.body;
      

           const findPost = await this.PostService.findPostById(id)
      

        const postOwner  = findPost?.author
      

            if (postOwner !== userId._id) {
               
                throw new Error('Sorry you are authorized');
            } else {

                const updatedPost = await this.PostService.editPost(    
                    id,
                    userId,
                    userObj
                );

                if (!updatedPost) {
                    throw new Error('Something went wrong');
                }

                res.status(200).json({
                    Success: true,
                    Message: 'Users successfully updated',
                    data: updatedPost,
                });
            }
        } catch (error) {
            return next(new HttpException(404, error.message));
        }
    };
    private deletePost = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | number | string | {} | void> => {
        try {
            const userId = req.user;
            let { id } = req.params;
            let userObj = req.body;
      

           const findPost = await this.PostService.findPostById(id)
      

        const postOwner  = findPost?.author
      

            if (postOwner !== userId._id) {
               
                throw new Error('Sorry you are authorized');
            } else {

                const deleteddPost = await this.PostService.removePost(    
                    id,
                    userId
                );

                if (!deleteddPost) {
                    throw new Error('Something went wrong');
                }

                res.status(200).json({
                    Success: true,
                    Message: 'Users successfully deleted',
                    data: deleteddPost,
                });
            }
        } catch (error) {
            return next(new HttpException(404, error.message));
        }
    };
}

export default PostController;
