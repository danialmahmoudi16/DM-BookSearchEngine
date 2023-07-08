const {AuthenticationError} = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        // get a single user by either their id or their username
        me: async (parent, args, context) => {
            if(context.user) {
                return User.findOne({_id: context.user._id})
            }
            throw new AuthenticationError('You need to be logged in!');
        }
    },
    Mutation: {
        // create a user
        addUser: async (parent, { username, email, password }) => {
            const user = await User.create({ username, email, password });
            const token = signToken(user);
            return {token, user};
        },
        // login a user
        login: async (parent, {email, password}) => {
            const user = await User.findOne({ email });

            if(!user) {
                throw new AuthenticationError('No user found with this email address');
            }

            const correctPw = await user.isCorrectPassword(password);

            if(!correctPw) {
                throw new AuthenticationError('Incorrect password');
            }

            const token = signToken(user);
            return {token, user};
        },
        // save a book
        saveBook: async (parent, { input }, context) => {
            if(context.user) {
                return User.findOneAndUpdate(
                    {_id: context.user._id},
                    {$addToSet: { savedBooks: input }},
                    {new: true}
                ); 
            }
            throw new AuthenticationError('You need to be logged in!');
        },
        // remove a book
        removeBook: async (parent, { bookId} , context) => {
            if (context.user) {
                const updateBook = await User.findOneAndUpdate(
                    {_id: context.user._id},
                    {$pull: {savedBooks: { bookId: bookId }}},
                    {new: true}
                );
                return updateBook;
            }
            throw new AuthenticationError('You need to be logged in!');
        }
    }
};

module.exports = resolvers;
        