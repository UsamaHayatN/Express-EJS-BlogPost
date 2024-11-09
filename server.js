const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(express.json());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

let blogsFile = `${__dirname}/dev-data/data/blogs-simple.json`;
let blogs = JSON.parse(fs.readFileSync(blogsFile));

// Files Paths
const homePage = `${__dirname}/views/home.ejs`;
const blogDetailsPage = `${__dirname}/views/blogDetails.ejs`;
const createBlog = `${__dirname}/index.ejs`;

app.get("/", (req, res) => {
  res.render(createBlog);
});

// Get all BlogPosts
app.get("/allblogs", (req, res) => {
  res.status(200).json({
    status: "success",
    results: blogs.length,
    data: {
      blogs,
    },
  });
});

// Render the Home Page
app.get("/home", (req, res) => {
  res.render(homePage, {
    blogs: blogs,
  });
});

const generateID = () => {
  return Math.floor(Math.random() * 10000);
};

// Create New Blog Post
app.post("/blog", (req, res) => {
  const blogTitle = req.body.blogTitle;
  const blogDescription = req.body.blogDescription;

  // Create a new blog object
  const newBlog = {
    id: generateID(),
    title: blogTitle,
    description: blogDescription,
  };

  blogs.push(newBlog);

  // Save the updated blogs to the file
  fs.writeFile(blogsFile, JSON.stringify(blogs), (error) => {
    if (error) {
      return res
        .status(500)
        .json({ status: "fail", message: "Could not save blog" });
    }

    // Send only the newly created blog in the response
    res.status(201).json({
      status: "success",
      data: {
        blog: newBlog,
      },
    });
  });
});

// Render All Blog Posts
app.post("/home", (req, res) => {
  fs.writeFile(blogsFile, JSON.stringify(blogs), (error) => {
    if (error) {
      return res
        .status(500)
        .send("<h1>Error: Could not save new blog post</h1>");
    }
    // Render the updated home page with the blogs list
    res.render(homePage, {
      blogs: blogs,
    });
  });
});

// Delete Blog
app.post("/delete/:id", (req, res) => {
  const blogId = parseInt(req.params.id);
  blogs = blogs.filter((blog) => blog.id !== blogId); // Make sure to correctly filter out the deleted blog

  fs.writeFile(blogsFile, JSON.stringify(blogs), (error) => {
    if (error) {
      return res.status(500).send("<h1>Error: Could not delete blog file</h1>");
    }
    // Redirect with a success message using a script
    res.send(
      '<script>alert("Blog deleted successfully"); window.location="/home";</script>'
    );
  });
});

// Render Blogs Details Page
app.get("/blogDetails/:id", (req, res) => {
  const blogId = parseInt(req.params.id);
  const blogDetails = blogs.find((blog) => blog.id === blogId); // Use `.find` instead of `.filter`
  if (!blogDetails) {
    return res.status(404).send("<h1>Error: Blog not found</h1>");
  }
  res.render(blogDetailsPage, {
    blogDetails: blogDetails,
  });
});

// Render Blog Edit Page
app.get("/edit/:id", (req, res) => {
  const blogId = parseInt(req.params.id);
  const blogDetails = blogs.find((blog) => blog.id === blogId); // Use `.find` instead of `.filter`
  if (!blogDetails) {
    return res.status(404).send("<h1>Error: Blog not found</h1>");
  }
  res.render(createBlog, {
    isEdit: true,
    blogDetails: blogDetails,
  });
});

// Update Blog
app.post("/edit/:id", (req, res) => {
  const blogId = parseInt(req.params.id);
  const editBlogIndex = blogs.findIndex((blog) => blog.id === blogId);

  if (editBlogIndex === -1) {
    return res.status(404).send("<h1>Error: Blog not found</h1>");
  }

  // Update blog properties
  blogs[editBlogIndex].title = req.body.blogTitle;
  blogs[editBlogIndex].description = req.body.blogDescription;

  // Save updated blogs to the file
  fs.writeFile(blogsFile, JSON.stringify(blogs), (error) => {
    if (error) {
      return res.status(500).send("<h1>Error: Could not update blog file</h1>");
    }
    // Render the updated home page with the blogs list
    res.render(homePage, {
      blogs: blogs,
    });
  });
});

const port = 5000;
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
