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

module.exports = {
    dummy, totalLikes, favoriteBlog
}