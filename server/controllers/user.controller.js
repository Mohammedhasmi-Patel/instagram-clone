import { User } from "../models/user.model.js";
import cloudinary from "../utils/cloudinary.js";
import getDataUri from "../utils/dataUri.js";

export const getProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    let user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User Not Found",
        success: false,
      });
    }

    return res.status(200).json({
      user,
      success: true,
    });
  } catch (error) {
    console.log(`error in getProfile function`);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

export const editProfile = async (req, res) => {
  try {
    const userId = req.id;

    const { bio, gender } = req.body;
    let profilePicture = req.file;
    let cloudinaryResponse;

    if (profilePicture) {
      const fileUri = getDataUri(profilePicture);

      cloudinaryResponse = await cloudinary.uploader.upload(fileUri);

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          message: "User Not Found",
          success: false,
        });
      }

      if (bio) {
        user.bio = bio;
      }

      if (gender) {
        user.gender = gender;
      }

      if (profilePicture) {
        user.profilePicture = cloudinaryResponse.secure_url;
        await user.save();
      }

      return res.status(200).json({
        message: "Profile Updated Successfully",
        success: true,
        user,
      });
    }
  } catch (error) {
    console.log(`error in editProfile controller`);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

export const getSuggestedUser = async (req, res) => {
  try {
    const suggestedUser = await User.find({ _id: { $ne: req.id } })
      .limit(5)
      .select("-password");

    if (!suggestedUser) {
      return res.status(404).json({
        message: "No Suggested Users Found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Suggested Users Fetched Successfully",
      success: true,
      suggestedUser,
    });
  } catch (error) {
    console.log(`error in suggestedUser controller`);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

export const followOrUnfollow = async (req, res) => {
  try {
    const followerId = req.id;
    const followingsId = req.params.id;

    if (followerId === followingsId) {
      return res.status(400).json({
        message: "You Cannot Follow Yourself",
        success: false,
      });
    }

    const user = await User.findById(followerId);
    const userToFollow = await User.findById(followingsId);

    if (!user || !userToFollow) {
      return res.status(404).json({
        message: "User Not Found",
        success: false,
      });
    }

    const isFollowing = user.followings.includes(followingsId);
    if (isFollowing) {
      // write logic to unfollow the user
      await Promise.all([
        User.updateOne(
          {
            _id: followerId,
          },
          {
            $push: { followings: followingsId },
          }
        ),

        User.updateOne([
          {
            _id: followingsId,
          },
          {
            $push: { followers: followerId },
          },
        ]),
      ]);

      return res.status(200).json({
        message: "Unfollowed Successfully",
        success: true,
      });
    } else {
      // write logic to follow the user
      await Promise.all([
        User.updateOne(
          {
            _id: followerId,
          },
          {
            $pull: { followings: followingsId },
          }
        ),

        User.updateOne(
          { _id: followingsId },
          { $pull: { followers: followerId } }
        ),
      ]);

      return res.status(200).json({
        message: "Followed Successfully",
        success: true,
      });
    }
  } catch (error) {
    console.log(`error in followOrUnfollow controller`);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};
