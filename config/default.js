module.exports = {
  port: 3000,
  session: {
    secret: 'myNodeBlog',
    key: 'myNodeBlog',
    maxAge: 2592000000
  },
  mongodb: 'mongodb://localhost:27017/my-node-blog'
};