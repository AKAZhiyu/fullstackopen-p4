const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
// const jwt = require('jsonwebtoken')

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1, id: 1 })
    response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
    const body = request.body
    const user = request.user

    if (!body.title || !body.url) {
        return response.status(400).json({
            error: `missing tittle or url`
        })
    }

    if (!user) {
        return response.status(401).json({
            error: `token invalid`
        })
    }

    const blog = new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes || 0,
        user: user.id
    })

    const savedBlog = await blog.save()
    await savedBlog.populate('user', { username: 1, name: 1, id: 1 })
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    return response.status(201).json(savedBlog)

})

blogsRouter.delete('/:id', async (request, response) => {
    const blog = await Blog.findById(request.params.id)
    if (!blog) {
        return response.status(204).end()
    }

    const user = request.user
    if (!user) {
        return response.status(401).json({ error: 'token invalid' })
    }

    if (blog.user.toString() === user.id.toString() ) {
        await Blog.findByIdAndDelete(request.params.id)

        user.blogs = user.blogs.filter(
            blogId => blogId.toString() !== request.params.id
        )
        await user.save()
        response.status(204).end()
    } else {
        response.status(401).json({ error: 'token invalid: unauthorized to delete this blog' })
    }
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
        title: body.title ? body.title : oldBlog.title,
        author: body.author ? body.author : oldBlog.author,
        url: body.url ? body.url : oldBlog.url,
    }

    const updatedBlog = await Blog.findByIdAndUpdate(id, blog, { new: true })
    const returnedBlog = await updatedBlog.populate('user', { username: 1, name: 1, id: 1 })
    response.status(200).json(returnedBlog)
})

module.exports = blogsRouter