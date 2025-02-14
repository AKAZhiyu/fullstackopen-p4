const _ = require('lodash');

const dummy = (blogs) => {
    return 1
}

const totalLikes = (blog_list) => {
    if (!blog_list || blog_list.length === 0) {
        return 0
    } else {
        return blog_list.reduce((accumulator, currentValue) => accumulator + currentValue.likes, 0)
    }
}

const favoriteBlog = (blog_list) => {
    if (!blog_list || blog_list.length === 0) {
        return null
    }

    const favorite = blog_list.reduce((favoriteBlog, currentBlog) => {
        return favoriteBlog.likes > currentBlog.likes ? favoriteBlog : currentBlog
    })

    return {
        title: favorite.title,
        author: favorite.author,
        likes: favorite.likes
    }
}

const mostBlogs = (blog_list) => {
    if (!blog_list || blog_list.length === 0) {
        return null
    }

    const blog_count = _.countBy(blog_list, 'author')

    const top_author = _.maxBy(Object.keys(blog_count), (author) => blog_count[author])

    return {
        blogs: blog_count[top_author],
        author: top_author
    }
}

const mostLikes = (blog_list) => {
    if (!blog_list || blog_list.length === 0) {
        return null
    }

    const author_blogs = _.groupBy(blog_list, 'author')

    const author_likes = _.map(author_blogs, (blogs, author) => {
        return {
            author: author,
            likes: _.sumBy(blogs, 'likes')
        }
    })

    const top_author = _.maxBy(author_likes, 'likes')

    return top_author
}
module.exports = {
    dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes
}