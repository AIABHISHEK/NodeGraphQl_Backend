const { buildSchema } = require("graphql");

module.exports = buildSchema(`
    type User{
        _id:ID!
        name:String!
        email:String!
        status:String!
        posts:[Post!]!
    }
    type Post{
        _id:ID!
        title:String!
        content:String!
        imageUrl:String!
        creator:User!
        createdAt:String!
        updatedAt:String!
    }
    input UserInputData{
        email:String!
        name:String!
        password:String!
    }
    input UserLoginData{
        email:String!
        password:String!
    }
    type authData{
        token:String!
        userId:String!
    }
    input postInputData{
        title:String!
        content: String!
        imageUrl: String!
    }
    type Posts {
        posts:[Post!]!
        totalPosts:Int!
    }
    type RootQuery {
        login(userInput: UserLoginData):authData!
        posts:Posts!
    }
    type RootMutation{
        createUser(userInput: UserInputData): User!
        createPost(postInput:postInputData): Post!
    }
    schema {
        query: RootQuery
        mutation: RootMutation
    }
`);
