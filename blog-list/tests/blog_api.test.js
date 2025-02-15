const { test, after, beforeEach, describe } = require('node:test')
const Blog = require('../models/blog')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')

const api = supertest(app)

describe('when there are some blogs saved initially', () => {
    beforeEach(async () => {
        await Blog.deleteMany({})
        await Blog.insertMany(helper.initialBlogs)
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

    test('should default likes to 0 if missing in the request body', async () => {
        const newBlog = {
            title: 'create a new blog tittle with like missing',
            author: 'new blog with like missing creator',
            url: 'http://www.newblog.missing.like',
        }

        const response = await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const newAddedBlog = response.body

        assert.strictEqual(newAddedBlog.title, 'create a new blog tittle with like missing')
        assert.strictEqual(newAddedBlog.likes, 0)
    })

    test('should return 400 if title or url is missing', async () => {
        const tittleMissingBlog = {
            author: 'new blog with title missing creator',
            url: 'http://www.newblog.missing.title',
            likes: 10
        }

        const urlMissingBlog = {
            title: 'create a new blog tittle m',
            author: 'new blog with like missing title',
            likes: 10
        }

        await api
            .post('/api/blogs')
            .send(tittleMissingBlog)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        await api
            .post('/api/blogs')
            .send(urlMissingBlog)
            .expect(400)
            .expect('Content-Type', /application\/json/)

    })

    describe('deletion of a blog', () => {
        test('succeeds with status code 204 when the blog exists', async () => {
            const blogsAtStart = await helper.blogsInDb()
            const blogToDelete = blogsAtStart[0]

            await api
                .delete(`/api/blogs/${blogToDelete.id}`)
                .expect(204)

            const blogsAtEnd = await helper.blogsInDb()

            assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)

            const titles = blogsAtEnd.map(b => b.title)
            assert(!titles.includes(blogToDelete.title))
        })

        test('returns 204 if blog does not exist', async () => {
            const nonExistId = await helper.nonExistingId()

            await api
                .delete(`/api/blogs/${nonExistId}`)
                .expect(204)

            const blogsAtEnd = await helper.blogsInDb()
            assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
        })
    })

    describe.only('updating of a blog', () => {
        test('succeeds with status code 200 when likes are updated', async () => {
            const blogsAtStart = await helper.blogsInDb()
            const blogToUpdate = blogsAtStart[0]
            const updatedBlog = {
                ...blogToUpdate,
                likes: blogToUpdate.likes + 1
            }

            const response = await api
                .put(`/api/blogs/${updatedBlog.id}`)
                .send(updatedBlog)
                .expect(200) 
                .expect('Content-Type', /application\/json/)

            assert.strictEqual(response.body.likes, blogToUpdate.likes + 1);

        })

        test('fails with status code 400 if likes is not provided', async () => {
            const initialBlogs = await helper.blogsInDb()
            const blogToUpdate = initialBlogs[0]
            await api
                .put(`/api/blogs/${blogToUpdate.id}`)
                .send({})
                .expect(400)
        })

    })
})

after(async () => {
    await mongoose.connection.close()
})