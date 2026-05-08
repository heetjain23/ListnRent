import * as categoryVideoService from "../services/categoryVideoService.js";

export const handleGetAllCategoryVideos = async (req, res) => {
  try {
    const categoryVideos = await categoryVideoService.getAllCategoryVideos();

    res.status(200).json({
      success: true,
      categoryVideos,
    });
  } catch (error) {
    console.error("Get category videos error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get category videos",
    });
  }
};

export const handleGetCategoryVideoByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const video = await categoryVideoService.getCategoryVideoByCategory(category);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Category video not found",
      });
    }

    res.status(200).json({
      success: true,
      video,
    });
  } catch (error) {
    console.error("Get category video by category error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get category video",
    });
  }
};

export const handleUpsertCategoryVideo = async (req, res) => {
  try {
    const { category, title, videoUrl, publicId, thumbnailUrl, fileName, instructions } = req.body;

    if (!category || !title || !videoUrl || !publicId || !fileName) {
      return res.status(400).json({
        success: false,
        message: "Category, title, video URL, public ID, and file name are required",
      });
    }

    const categoryVideo = await categoryVideoService.upsertCategoryVideo({
      category,
      title,
      videoUrl,
      publicId,
      thumbnailUrl,
      fileName,
      instructions,
      uploadedByEmail: req.admin?.email || req.user?.email || "",
      uploadedByName: req.admin?.displayName || "",
    });

    res.status(200).json({
      success: true,
      message: "Category video saved successfully",
      categoryVideo,
    });
  } catch (error) {
    console.error("Upsert category video error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to save category video",
    });
  }
};

export const handleUpdateCategoryVideo = async (req, res) => {
  try {
    const { id } = req.params;

    const categoryVideo = await categoryVideoService.updateCategoryVideoById(id, req.body);

    if (!categoryVideo) {
      return res.status(404).json({
        success: false,
        message: "Category video not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Category video updated successfully",
      categoryVideo,
    });
  } catch (error) {
    console.error("Update category video error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update category video",
    });
  }
};

export const handleDeleteCategoryVideo = async (req, res) => {
  try {
    const { id } = req.params;

    const categoryVideo = await categoryVideoService.deleteCategoryVideoById(id);

    if (!categoryVideo) {
      return res.status(404).json({
        success: false,
        message: "Category video not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Category video deleted successfully",
    });
  } catch (error) {
    console.error("Delete category video error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to delete category video",
    });
  }
};