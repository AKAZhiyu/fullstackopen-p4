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

after(async () => {
    await mongoose.connection.close()
})