const { test, after, beforeEach } = require('node:test')
const Blog = require('../models/blog')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')

const api = supertest(app)

beforeEach(async () => {
    await Blog.deleteMany({})
    for (let blog of helper.initialBlogs) {
        let blogObj = new Blog(blog)
        await blogObj.save()
    }
})

test('the blog get all request', async () => {
    const response = await api.get('/api/blogs')

    assert.strictEqual(helper.initialBlogs.length, response.body.length)
})

test('the unique identifier property of blog posts is named id', async () => {
    const response = await api.get('/api/blogs')

    response.body.forEach(blog => {
        assert.ok(blog.id)
        assert.strictEqual(blog._id, undefined)
    })
})

test('the post request creates a new blog', async () => {
    const newBlog = {
        title: 'create a new blog tittle',
        author: 'new blog creator',
        url: 'http://www.newblog.creator',
        likes: 99
    }

    await api.post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

    const contents = blogsAtEnd.map(n => n.title)
    assert(contents.includes('create a new blog tittle'))
})

after(async () => {
    await mongoose.connection.close()
})