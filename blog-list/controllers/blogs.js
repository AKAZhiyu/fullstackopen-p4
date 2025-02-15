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

blogsRouter.put('/:id', async (request, response) => {
    const id = request.params.id
    const body = request.body
    
    if (body.likes === undefined || body.likes === null) {
        return response.status(400).json({ error: 'Likes are required to update the blog' });
    }

    const oldBlog = await Blog.findById(id)
    
    if (!oldBlog) {
        return response.status(404).json({ error: 'Blog not found' })
    }

    const blog = {
        likes: body.likes,
        title: body.title ? body.title : blog.title,
        author: body.author ? body.author: blog.author,
        url: body.url ? body.url : blog.url,
    }

    const updatedBlog = await Blog.findByIdAndUpdate(id, blog, { new: true })

    response.status(200).json(updatedBlog)
})

module.exports = blogsRouter