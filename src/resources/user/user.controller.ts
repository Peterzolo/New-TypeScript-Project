import { Router, Request, Response, NextFunction } from 'express';
import Controller from '@/utils/interfaces/controller.interface';
import HttpException from '@/utils/exceptions/http.exception';
import validationMiddleware from '@/middleware/validation.middleware';
import validate from '@/resources/user/user.validation';
import UserService from '@/resources/user/user.service';
import authenticated from '@/middleware/authenticated.middleware';
import bcrypt from 'bcrypt';
import userModel from './user.model';

class UserController implements Controller {
    public path = '/users';
    public router = Router();
    private UserService = new UserService();

    constructor() {
        this.initialiseRoutes();
    }

    private initialiseRoutes(): void {
        this.router.post(
            `${this.path}/register`,
            validationMiddleware(validate.register),
            this.register
        );
        this.router.post(
            `${this.path}/login`,
            validationMiddleware(validate.login),
            this.login
        );
        // this.router.get(`${this.path}/get-one`, authenticated, this.getUser);
        this.router.get(
            `${this.path}/get-all`,
            authenticated,
            this.getAllUsers
        );
        this.router.get(
            `${this.path}/get-own`,
            authenticated,
            this.getOwnAccount
        );
        this.router.put(
            `${this.path}/edit/:id`,
            authenticated,
            this.updateUser
        );
        this.router.delete(
            `${this.path}/remove-own`,
            authenticated,
            this.removeOwnAccount
        );
        this.router.put(
            `${this.path}/:id/follow`,
            authenticated,
            this.createFollows
        );
        this.router.put(
            `${this.path}/:id/unfollow`,
            authenticated,
            this.createUnfollows
        );
    }

    private register = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const {
                firstName,
                lastName,
                email,
                password,
                role,
                post,
                followers,
                followings,
                status,
            } = req.body;

            const token = await this.UserService.register(
                firstName,
                lastName,
                email,
                password,
                role,
                post,
                followers,
                followings,
                status
            );
            res.status(201).json({ token });
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private login = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const { email, password } = req.body;

            const token = await this.UserService.login(email, password);

            res.status(200).json({ email,token });
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    // private getUser = (
    //     req: Request,
    //     res: Response,
    //     next: NextFunction
    // ): Response | void => {
    //     if (!req.user) {
    //         return next(new HttpException(404, 'No logged in user'));
    //     }

    //     res.status(200).send({ data: req.user });
    // };

    private getAllUsers = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const userId = req.user;

            if (userId.role !== 'admin') {
                throw new Error('Not authorized');
            }
            const users = await this.UserService.fetchUsers();
            if (users.length < 1) {
                throw new Error('No user was found');
            }
            res.status(200).json({
                Success: true,
                Message: 'Users successfully fetched',
                UserCount: users.length,
                Data: users,
            });
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private getOwnAccount = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | number | void> => {
        try {
            const userId = req.user._id;

            const ownUser = await this.UserService.fetchOwwn(userId);
            console.log('OWN USER', ownUser);
            if (!ownUser) {
                throw new Error('Something went wrong');
            }
            res.status(200).json({
                Success: true,
                Message: 'Users successfully fetched',
                Data: ownUser,
            });
        } catch (error) {
            return next(new HttpException(404, 'Could not fetch users'));
        }
    };

    private updateUser = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | number | string | {} | void> => {
        try {
            const userId = req.user;
            let { id } = req.params;
            let userObj = req.body;
            // let password = userObj.password;

            const findUser = await this.UserService.userExists(userId);
            if (!findUser) {
                throw new Error('User not found');
            }

            console.log('ID', id);
            console.log('USER ID', userId.id);
            console.log('ROLE', findUser.role);

            if (id === userId.id || findUser.role === 'admin') {
                const updatedUser = await this.UserService.editOwwnAccount(
                    id,
                    userId,
                    userObj
                );

                if (!updatedUser) {
                    throw new Error('Something went wrong');
                }

                res.status(200).json({
                    Success: true,
                    Message: 'Users successfully updated',
                    data: updatedUser,
                });
            } else {
                throw new Error('Sorry you are authorized');
            }

            // const salt = await bcrypt.genSalt(10);
            // const hashedPassword = await bcrypt.hash(password, salt);

            // if (password) {
            //     password = hashedPassword;
            // }
        } catch (error) {
            return next(new HttpException(404, error.message));
        }
    };

    private removeOwnAccount = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | number | string | void> => {
        try {
            const userId = req.user._id;
            const deleteObj = req.body.status;

            const findUser = await this.UserService.userExists(userId);
            if (!findUser) {
                throw new Error('User not found');
            }

            const deletedUser = await this.UserService.deleteOwwnAccount(
                userId
            );

            if (!deletedUser) {
                throw new Error('Something went wrong');
            }
            res.status(200).json({
                Success: true,
                Message: 'Users successfully deleted',
                Data: deletedUser,
            });
        } catch (error) {
            return next(new HttpException(404, 'Could not edit user'));
        }
    };

    private createFollows = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | Array<object> | string | void> => {
        try {
            let loggedIn = await userModel.findById(req.user._id);
            let paramsUser = await userModel.findById(req.params.id);

            if (loggedIn == paramsUser) {
                throw new Error('You cannot follow yourselff');
            }

            const loggedInFollowers = loggedIn?.followers;

            console.log(loggedInFollowers);

            if (loggedIn === paramsUser) {
                res.status(404).json({ message: 'You cannot follow yourself' });
            } else {
                let followUser = await userModel.findOneAndUpdate(
                    { _id: paramsUser },
                    { $addToSet: { followers: loggedIn } },
                    { new: true }
                );
                let user = await userModel.findOneAndUpdate(
                    { _id: loggedIn },
                    { $addToSet: { followings: paramsUser } },
                    { new: true }
                );
            }
            return res
                .status(200)
                .send({ message: 'User followed successfully' });
        } catch (err) {
            return res
                .status(500)
                .send({ message: 'Error while tried to follow a user' });
        }
    };

    private createUnfollows = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | Array<object> | string | void> => {
        try {
            let unfollowingUser = await userModel.findByIdAndUpdate(
                req.params.id,
                {
                    $pull: { followers: req.user._id },
                }
            );
            return res
                .status(200)
                .send({ message: 'User unfollowed successfully' });
        } catch (err) {
            return res.status(500).send({ message: 'User UnFollow Failed' });
        }
    };
}

export default UserController;
