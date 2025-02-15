const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({})
    response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
    const body = request.body

    if (!body.title || !body.url) {
        return response.status(400).json({
            error: `missing tittle or url`
        })
    }

    const blog = new Blog({
        title: body.title,
        author: body.String,
        url: body.url,
        likes: body.likes || 0
    })

    const savedBlog = await blog.save()
    response.status(201).json(savedBlog)

})

blogsRouter.delete('/:id', async (request, response) => {
    await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()
})

module.exports = blogsRouter