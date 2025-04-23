import sharp from "sharp";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import cloudinary from "../utils/cloudinary.js";

export const addNewPost = async (req, res) => {
  try {
    const { caption } = req.body;
    const authUserId = req.id;

    const image = req.file;

    if (!image) {
      return res.status(400).json({ message: "Image is required" });
    }

    // image upload
    const optimizeImage = await sharp(image.buffer)
      .resize(800, 800)
      .toFormat("jpeg")
      .jpeg({ quality: 80 })
      .toBuffer();

    // buffer to data URI
    const fileURI = `data:${image.mimetype};base64,${optimizeImage.toString(
      "base64"
    )}`;

    const cloudResponse = await cloudinary.uploader.upload(fileURI);
    const post = await Post.create({
      caption,
      image: cloudResponse.secure_url,
      author: authUserId,
    });

    const user = await User.findById(authUserId);
    if (user) {
      user.posts.push(post._id);
      await user.save();
    }

    await post.populate("author", "-password -__v");

    res.status(201).json({
      message: "Post created successfully",
      success: true,
      post,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({ path: "author", select: "username, profilePicture" })
      .populate({
        path: "comments",
        sort: { createdAt: -1 },
        populate: { path: "author", select: "username, profilePicture" },
      });

    res.status(200).json({ success: true, posts });
  } catch (error) {
    console.log(`error in getAllPosts: ${error}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const userId = req.id;
    const posts = await Post.find({ author: userId })
      .sort({ createdAt: -1 })
      .populate({ path: "author", select: "username, profilePicture" })
      .populate({
        path: "comments",
        sort: { createdAt: -1 },
        populate: { path: "author", select: "username, profilePicture" },
      });

    res.status(200).json({ success: true, posts });
  } catch (error) {
    console.log(`error in getUserPosts: ${error}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const likePost = async (req, res) => {
  try {
    const likePostId = req.params.id;
    const userId = req.id;

    const post = await Post.findById(likePostId);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    // like logic

    await post.updateOne({
      $addToSet: { likes: userId },
    });

    await post.save();

    // implement socket io for like

    return res.status(200).json({
      success: true,
      message: "Post liked successfully",
      post,
    });
  } catch (error) {
    console.log(`error in likePost: ${error}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const dislikePost = async (req, res) => {
  try {
    const dislikePostId = req.params.id;
    const userId = req.id;

    const post = await Post.findById(dislikePostId);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    // unlike logic

    await post.updateOne({
      $pull: { likes: userId },
    });

    await post.save();

    // implement socket io for unlike

    return res.status(200).json({
      success: true,
      message: "Post unliked successfully",
      post,
    });
  } catch (error) {
    console.log(`error in unlikePost: ${error}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const addComment = async () => {
  try {
    const postId = req.params.id;
    const userId = req.id;
    const { text } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (!text) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const comment = await Comment.create({
      text,
      author: userId,
      post: postId,
    }).populate("author", "username, profilePicture");

    post.comments.push(comment._id);
    await post.save();

    return res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment,
    });
  } catch (error) {
    console.log(`error in addComment: ${error}`);
    res.status(500).json({ message: "Internal server error" });
  }
};
