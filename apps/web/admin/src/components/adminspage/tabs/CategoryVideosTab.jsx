import React from 'react'
import { toast } from 'sonner'
import PageHeader from '../../shared/PageHeader'
import { adminApi } from '../../../services/api'
import { uploadVideo } from '../../../services/cloudinary'
import { CATEGORY_VIDEO_GUIDANCE, CATEGORIES } from '../../../constants'

const DEFAULT_FORM = {
  category: CATEGORIES[0] || '',
  title: CATEGORIES[0] || '',
  instructions: CATEGORY_VIDEO_GUIDANCE,
}

const CategoryVideosTab = () => {
  const [videos, setVideos] = React.useState([])
  const [form, setForm] = React.useState(DEFAULT_FORM)
  const [selectedFile, setSelectedFile] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [submitting, setSubmitting] = React.useState(false)

  const loadVideos = React.useCallback(async () => {
    setLoading(true)
    try {
      const response = await adminApi.getCategoryVideos()
      setVideos(response.categoryVideos || [])
    } catch (error) {
      toast.error(error.message || 'Failed to load category videos')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadVideos()
  }, [loadVideos])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'category' ? { title: value } : {}),
    }))
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null

    if (file && !file.type.startsWith('video/')) {
      toast.error('Please choose a video file.')
      event.target.value = ''
      return
    }

    setSelectedFile(file)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!form.category || !form.title.trim()) {
      toast.error('Select a category and enter a title.')
      return
    }

    if (!selectedFile) {
      toast.error('Upload a video file first.')
      return
    }

    try {
      setSubmitting(true)
      const uploaded = await uploadVideo(selectedFile)

      await adminApi.saveCategoryVideo({
        category: form.category,
        title: form.title.trim(),
        instructions: form.instructions.trim(),
        ...uploaded,
      })

      toast.success(`Saved video for ${form.category}`)
      setForm((prev) => ({
        ...prev,
        instructions: CATEGORY_VIDEO_GUIDANCE,
      }))
      setSelectedFile(null)
      event.target.reset()
      await loadVideos()
    } catch (error) {
      toast.error(error.message || 'Failed to save category video')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Delete this category video?')
    if (!confirmed) return

    try {
      await adminApi.deleteCategoryVideo(id)
      toast.success('Category video deleted')
      await loadVideos()
    } catch (error) {
      toast.error(error.message || 'Failed to delete category video')
    }
  }

  return (
    <>
      <PageHeader
        title="Measurement Guide Videos"
        subtitle="Upload one outfit measurement guide per category. The client details step loads the guide by exact category name."
      >
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">Measurement rule</p>
          <p className="mt-1 leading-6">{CATEGORY_VIDEO_GUIDANCE}</p>
        </div>
      </PageHeader>

      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-xl font-bold text-gray-900">Upload / Replace Measurement Guide</h2>
          <p className="mt-2 text-sm text-gray-600">
            Choose the exact category, keep the title aligned with that category, and upload the video that explains how to take measurements.
          </p>

          <div className="mt-5 space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Category
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-teal-600 focus:outline-none"
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium text-gray-700">
              Title
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-teal-600 focus:outline-none"
                placeholder="Keep this aligned with the category name"
              />
            </label>

            <label className="block text-sm font-medium text-gray-700">
              Measurement guidance
              <textarea
                name="instructions"
                value={form.instructions}
                onChange={handleChange}
                rows={4}
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-teal-600 focus:outline-none"
                placeholder="Explain which body points to measure, how to measure them, and any category-specific fit tips"
              />
            </label>

            <label className="block text-sm font-medium text-gray-700">
              Measurement guide video
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="mt-2 w-full rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-teal-600 file:px-4 file:py-2 file:text-white"
              />
            </label>

            {selectedFile && (
              <p className="text-xs text-gray-500">Selected: {selectedFile.name}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-teal-600 px-4 py-3 font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Saving...' : 'Save Measurement Guide'}
            </button>
          </div>
        </form>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Uploaded Guides</h2>
              <p className="text-sm text-gray-600">One measurement guide per category.</p>
            </div>
            <button
              type="button"
              onClick={loadVideos}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Refresh
            </button>
          </div>

          <div className="mt-5 space-y-4">
            {loading ? (
              <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
                Loading measurement guides...
              </div>
            ) : videos.length ? (
              videos.map((video) => (
                <div key={video._id} className="rounded-xl border border-gray-200 p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">
                        {video.category}
                      </p>
                      <h3 className="text-lg font-semibold text-gray-900">{video.title}</h3>
                      <p className="text-sm text-gray-600">
                        File: {video.fileName}
                      </p>
                      {video.instructions && (
                        <p className="text-sm leading-6 text-gray-600">{video.instructions}</p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <a
                        href={video.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        Preview
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDelete(video._id)}
                        className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {video.videoUrl && (
                    <video
                      className="mt-4 w-full rounded-lg bg-black"
                      controls
                      preload="metadata"
                    >
                      <source src={video.videoUrl} />
                    </video>
                  )}
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
                No measurement guides uploaded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default CategoryVideosTab