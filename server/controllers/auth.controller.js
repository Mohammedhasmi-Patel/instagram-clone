import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(401).json({
        message: "All Fields Are Required.",
        success: false,
      });
    }

    // check whether already user created with this email id

    const user = await User.findOne({ email });
    if (user) {
      return res.status(409).json({
        message: "Email Already Taken.",
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      username,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "User Registered Successfully.",
      success: true,
    });
  } catch (error) {
    console.log(`error in register ${error}`);
    return res.status(500).json({
      message: "Internal Server Error.",
      success: false,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(401).json({
        message: "All Fields Are Required.",
        success: false,
      });
    }

    let user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "Invalid Credentials.",
        success: false,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid Credentials.",
        success: false,
      });
    }

    const token = await jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        message: "User Logged In Successfully.",
        success: true,
        token,
        user,
      });
  } catch (error) {
    console.log(`error in login ${error}`);
    return res.status(500).json({
      message: "Internal Server Error.",
      success: false,
    });
  }
};

export const logout = async (req, res) => {
  try {
    return res.cookie({ token: "" }, { maxAge: 0 }).json({
      message: "Logged Out Successfully...",
    });
  } catch (error) {
    console.log(`error in logout controller ${error}`);

    return res.status(500).json({
      message: "Internal Server error...",
      success: false,
    });
  }
};
