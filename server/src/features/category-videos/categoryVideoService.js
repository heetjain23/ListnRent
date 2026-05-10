import CategoryVideo from "./CategoryVideo.js";

const normalizeCategory = (category) => String(category || "").trim();

export const getAllCategoryVideos = async () => {
  return CategoryVideo.find().sort({ category: 1 }).lean();
};

export const getCategoryVideoByCategory = async (category) => {
  const normalizedCategory = normalizeCategory(category);
  if (!normalizedCategory) return null;

  return CategoryVideo.findOne({ category: normalizedCategory }).lean();
};

export const upsertCategoryVideo = async (payload) => {
  const normalizedCategory = normalizeCategory(payload.category);

  const nextPayload = {
    ...payload,
    category: normalizedCategory,
    title: String(payload.title || normalizedCategory).trim(),
    videoUrl: String(payload.videoUrl || "").trim(),
    publicId: String(payload.publicId || "").trim(),
    fileName: String(payload.fileName || normalizedCategory).trim(),
    instructions: String(payload.instructions || "").trim(),
  };

  const categoryVideo = await CategoryVideo.findOneAndUpdate(
    { category: normalizedCategory },
    { $set: nextPayload },
    { returnDocument: 'after', upsert: true, runValidators: true, setDefaultsOnInsert: true },
  );

  return categoryVideo;
};

export const updateCategoryVideoById = async (id, updates) => {
  return CategoryVideo.findByIdAndUpdate(
    id,
    {
      $set: {
        ...updates,
        ...(updates.category ? { category: normalizeCategory(updates.category) } : {}),
      },
    },
    { returnDocument: 'after', runValidators: true },
  );
};

export const deleteCategoryVideoById = async (id) => {
  return CategoryVideo.findByIdAndDelete(id);
};