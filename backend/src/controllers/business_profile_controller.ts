import { Request, Response } from "express";
import BusinessProfile from "../models/business_profile_model";

const getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.params.userId;
      const profile = await BusinessProfile.findOne({ userId });
  
      if (!profile) {
        res.status(404).json({ message: "Business profile not found" });
        return;
      }
  
      res.status(200).json(profile);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  };
  
const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const update = req.body;

    const profile = await BusinessProfile.findOneAndUpdate(
      { userId },
      update,
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json(profile);
  } catch (error) {
    res.status(400).json({ message: "Error updating profile", error });
  }
};

export default { getProfile, updateProfile };
