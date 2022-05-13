import UserModel from '@/resources/user/user.model';
import token from '@/utils/token';

// exports.userExists = async(query:string) =>{
//  const user = await UserModel.findOne({query})
//  return user
// }

class UserService {
    private user = UserModel;

    /**
     * Register a new user
     */
    public async register(
        firstName: string,
        lastName: string,
        email: string,
        password: string,
        post: string,
        followers: string,
        folloings: string,
        role: string,
        status: string
    ): Promise<string | {} | Error> {
        try {
            const userExist = await this.user.findOne({ email });

            if (userExist) {
                throw new Error('User already exists');
            }

            const user = await this.user.create({
                firstName,
                lastName,
                email,
                password,
                post,
                followers,
                folloings,
                role,
                status,
            });
            const accessToken = token.createToken(user);
            return {
                firstName,
                lastName,
                email,
                role,
                post,
                followers,
                folloings,
                status,
                accessToken,
            };
        } catch (error) {
            throw new Error(error.message);
        }
    }

    public async login(
        email: string,
        password: string
    ): Promise<string | Error> {
        try {
            const user = await this.user.findOne({ email });

            if (!user) {
                throw new Error('Unable to find user with that email address');
            }

            if (await user.isValidPassword(password)) {
                return token.createToken(user);
            } else {
                throw new Error('Wrong credentials given');
            }
        } catch (error) {
            // throw new Error('Unable to login user');
            throw new Error(error.message);
        }
    }

    public async fetchUsers() {
        try {
            const getAllUsers = await this.user
                .find({ status: 'active' })
                .select('-password');
            return getAllUsers;
        } catch (error) {
            throw new Error('Unable to find user');
        }
    }

    public async fetchOwwn(userId: {}) {
        try {
            const ownUser = await this.user
                .findOne({ _id: userId, status: 'active' })
                .select('-password');
            return ownUser;
        } catch (error) {
            throw new Error('Unable to find user');
        }
    }

    public async editOwwnAccount(id: {}, userId: {}, editObj: {}) {
        try {
            const editOwn = await this.user
                .findByIdAndUpdate(
                    { _id: id, user: userId },
                    { $set: editObj },
                    { new: true }
                )
                .select('-password');
            return editOwn;
        } catch (error) {
            throw new Error('Unable to edit user');
        }
    }

    public async deleteOwwnAccount(userId: {}) {
        try {
            const deleteOwn = await this.user
                .findByIdAndUpdate(
                    { _id: userId },
                    { $set: { status: 'inactive' } },
                    { new: true }
                )
                .select('-password');
            return deleteOwn;
        } catch (error) {
            throw new Error('Unable to delete user');
        }
    }

    public async createFollowers(id: string, userId: {}, updateObj: {}) {
        try {
            const updateFollows = await this.user.findByIdAndUpdate(
                { _id: id, user: userId },
                { follow: updateObj }
            );
            return updateFollows;
        } catch (error) {
            throw new Error('Unable to delete user');
        }
    }

    public async userExists(payload: {}) {
        try {
            const user = await this.user.findById(payload);
            return user;
        } catch (error) {
            throw new Error('Unable to find user');
        }
    }

    public async findUserById(id : string) {
        try {
            const user = await this.user.findById({_id : id});
            return user;
        } catch (error) {
            throw new Error('Unable to find user');
        }
    }
}

export default UserService;
