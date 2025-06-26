import OrderModel from "../models/order.model.js";
import UserModel from "../models/user.model.js";

export const getReferralStatsController = async (req, res) => {
  try {
    const users = await UserModel.find().select(
      "name email referralCode referredBy rewardWallet hasUsedReferral"
    );

    const referralMap = {};
    users.forEach(user => {
      if (user.referredBy) {
        referralMap[user.referredBy] = (referralMap[user.referredBy] || 0) + 1;
      }
    });

    const formattedUsers = users.map(user => ({
      name: user.name,
      email: user.email,
      referralCode: user.referralCode || "—",
      referredBy: user.referredBy || "—",
      rewardWallet: user.rewardWallet || 0,
      hasUsedReferral: user.hasUsedReferral || false,
      referredCount: referralMap[user.referralCode] || 0,
    }));

    return res.json({
      success: true,
      message: "Referral stats fetched successfully",
      data: formattedUsers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || "Something went wrong",
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.find().select("-password"); // Exclude password
    res.status(200).json({
      success: true,
      data: users,
      message: "All users fetched successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: true,
      message: error.message || "Something went wrong",
    });
  }
};


export const getAllOrders = async (req, res) => {
  try {
    const orders = await OrderModel.find()
      .populate("userId", "name email") // get user details
      .populate("items.productId", "name price image")
      .populate("delivery_address");
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};