const bcrypt = require('bcrypt');
const validator = require('validator');
const User = require('../model/user');
const Post = require('../model/post');
const jwt = require('jsonwebtoken');

module.exports = {
    login: async function({userInput}){
        const email = userInput.email
        const password = userInput.password
        console.table(userInput);
        const user = await User.findOne({email:email})
        if(!user){
            let err = new Error('User does not exist');
            err.code = 401;
            throw err;
        }
        let isEqual = await bcrypt.compare(password, user.password)
        if(!isEqual){
            let err = new Error('wrong password');
            err.code = 401;
            throw err;
        }
        
        let token = jwt.sign({ _id: user._id, email:email }, "abhishek", { expiresIn: "30 days" });
        console.log(token);
        return {token:token.toString(), userId:user._id.toString()};
    },
    
    createUser: async function({ userInput }, req){
        const email = userInput.email;
        const password = userInput.password;
        const name = userInput.name;
        let error = [];
        if(!validator.isEmail(email)){
            console.log("check");
            error.push({message: 'Invalid Email'});
        }
        if(validator.isEmpty(password) || !validator.isLength(password, {min:5})){
            console.log(validator.isEmpty(password));
            error.push({message: 'Invalid Length'})
        }
        if(error.length > 0){
            let err = new Error('Invalid Input');
            err.data = error;
            err.code = 422;
            throw err;
        }
        const userExist = await User.findOne({email:email})
        if(userExist){
            const error = new Error("User exists already")
            throw error
        }
        const hashPassword = await bcrypt.hash(password, 12)
        const user = new User({
            name: name,
            password: hashPassword,
            email: email
        })
        const createdUser = await user.save();
        return { 
            ...createdUser._doc, 
            _id: createdUser._id.toString()
        }
    },
    createPost: async function({postInput}, req){
        // console.log(req.body);
        console.log("post creating");
        console.log(req.isAuth);
        if(!req.isAuth){
            console.log("not authenticated");
            let err = new Error("Not Authenticated");
            err.code = 401;
            throw err;
        }
        let error = [];
        if(validator.isEmpty(postInput.title) || !validator.isLength(postInput.title))
        error.push({message:"Title is invalid"})
        if(validator.isEmpty(postInput.content) || !validator.isLength(postInput.content, {min: 5}))
        error.push({message:"Content is Invalid"});
        if(error.length > 0){
            console.log("input error");
            let err = new Error('Invalid Input');
            err.data = error;
            err.code = 422;
            throw err;
        }
        console.log(req.userId);
        const user = await User.findById(req.userId);
        console.log(user);
        if(!user){
            console.log("user not found");
            let error = new Error('Invalid user')
            error.code = 401;
            throw error;
        }
        // console.log("postInput + ", postInput.title);
        const post = new Post({
            title:postInput.title.toString(),
            content:postInput.content.toString(),
            imageUrl:postInput.imageUrl.toString(),
            creator:user
        }) 
        let createdPost;
        try {
            createdPost = await post.save();
            user.posts.push(createdPost);
            await user.save();
        } catch (error) {
            console.log(error);
        }

        let val = {
            ...createdPost._doc,
            _id:createdPost._id.toString(),
            createdAt: createdPost.createdAt.toISOString(),
            updatedAt: createdPost.updatedAt.toISOString()
        }
        console.log(val);
        return val;
    },
    posts: async function(arg, req){
        // if(!req.isAuth){
        //     console.log("not authenticated");
        //     let err = new Error("Not Authenticated");
        //     err.code = 401;
        //     throw err;
        // }
        let posts;
        let totalPosts;
        try {
            totalPosts = await Post.countDocuments();
            posts = await Post.find().sort({createdAt: -1}).populate('creator');
        } catch (error) {
            throw error;
        }
        return {
            posts: posts.map(post => {
                return {...post._doc,
                    _id: post._id.toString(),
                    createdAt: post.createdAt.toISOString(),
                    updatedAt: post.updatedAt.toISOString()
                }
            }),
            totalPosts:totalPosts
        }
    }
    
}