if(process.env.NODE_ENV == 'production') {
  module.exports = {mongoURI: 'mongodb+srv://alepranskunas:4ZQYwIu2BOSf1UoY@cluster0.ymsh30n.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'}
}else {
  module.exports = {mongoURI: 'mongodb://localhost/blogapp'}
}