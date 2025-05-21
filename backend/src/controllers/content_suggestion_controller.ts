import { Request, Response, NextFunction } from "express";
import BusinessProfile from "../models/business_profile_model";
import ContentSuggestion from "../models/content_suggestion_model";
import { generateContentFromProfile } from "../services/content_suggestion_service";

export const getOrGenerateSuggestions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.userId;

    const existing = await ContentSuggestion.find({ userId }).sort({ createdAt: -1 });

    const isOutdated = existing.some(suggestion => {
      const age = Date.now() - new Date(suggestion.createdAt).getTime();
      return age > 24 * 60 * 60 * 1000;
    });

    if (existing.length < 3 || isOutdated) {
      await ContentSuggestion.deleteMany({ userId });

      const profile = await BusinessProfile.findOne({ userId });
      if (!profile) {
        res.status(404).json({ error: "No business profile found" });
        return;
      }

      const generated = await generateContentFromProfile(profile);
      const saved = await ContentSuggestion.insertMany(
        generated.map(item => ({
          ...item,
          userId,
          refreshed: false,
          createdAt: new Date()
        }))
      );

      res.status(200).json(saved);
      return;
    }

    res.status(200).json(existing);
  } catch (err) {
    next(err);
  }
};

export const refreshSingleSuggestion = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { suggestionId } = req.params;
    const userId = req.params.userId;

    const profile = await BusinessProfile.findOne({ userId });
    if (!profile) {
      res.status(404).json({ error: "No business profile found" });
      return;
    }

    const [newContent] = await generateContentFromProfile(profile, 1);

    const updated = await ContentSuggestion.findByIdAndUpdate(
      suggestionId,
      {
        ...newContent,
        refreshed: true,
        createdAt: new Date(),
      },
      { new: true }
    );

    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};
