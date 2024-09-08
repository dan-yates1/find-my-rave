"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { createEventSchema, CreateEventFormData } from "@/lib/validation";

const CreateEventPage: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventSchema),
  });

  const onSubmit = async (data: CreateEventFormData) => {
    setLoading(true);

    let imageUrl = "";

    // Handle image upload if provided
    if (data.image && data.image.length > 0) {
      const formData = new FormData();
      formData.append("file", data.image[0]);

      try {
        const uploadResponse = await fetch("/api/upload-image", {
          method: "POST",
          body: formData,
        });

        const uploadResult = await uploadResponse.json();
        imageUrl = uploadResult.imageUrl;
      } catch (error) {
        console.error("Failed to upload image:", error);
        setLoading(false);
        return;
      }
    }

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...data, imageUrl }),
      });

      if (response.ok) {
        router.push("/find-events");
      } else {
        console.error("Failed to create event");
      }
    } catch (error) {
      console.error("An error occurred:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 border rounded-lg p-4 mt-10 mb-1">
      <h1 className="text-3xl font-bold mb-8">Create a New Event</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Event Title
          </label>
          <input
            id="title"
            type="text"
            {...register("title")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <textarea
            id="description"
            {...register("description")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">
              {errors.description?.message}
            </p>
          )}
        </div>

        {/* Start Date */}
        <div>
          <label
            htmlFor="startDate"
            className="block text-sm font-medium text-gray-700"
          >
            Start Date
          </label>
          <input
            id="startDate"
            type="datetime-local"
            {...register("startDate")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          {errors.startDate && (
            <p className="text-red-500 text-sm mt-1">
              {errors.startDate?.message}
            </p>
          )}
        </div>

        {/* End Date */}
        <div>
          <label
            htmlFor="endDate"
            className="block text-sm font-medium text-gray-700"
          >
            End Date
          </label>
          <input
            id="endDate"
            type="datetime-local"
            {...register("endDate")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          {errors.endDate && (
            <p className="text-red-500 text-sm mt-1">
              {errors.endDate?.message}
            </p>
          )}
        </div>

        {/* Location */}
        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-700"
          >
            Location
          </label>
          <input
            id="location"
            type="text"
            {...register("location")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          {errors.location && (
            <p className="text-red-500 text-sm mt-1">
              {errors.location?.message}
            </p>
          )}
        </div>

        {/* Latitude */}
        <div>
          <label
            htmlFor="latitude"
            className="block text-sm font-medium text-gray-700"
          >
            Latitude (optional)
          </label>
          <input
            id="latitude"
            type="text"
            {...register("latitude")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          {errors.latitude && (
            <p className="text-red-500 text-sm mt-1">
              {errors.latitude?.message}
            </p>
          )}
        </div>

        {/* Longitude */}
        <div>
          <label
            htmlFor="longitude"
            className="block text-sm font-medium text-gray-700"
          >
            Longitude (optional)
          </label>
          <input
            id="longitude"
            type="text"
            {...register("longitude")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          {errors.longitude && (
            <p className="text-red-500 text-sm mt-1">
              {errors.longitude?.message}
            </p>
          )}
        </div>

        {/* Link */}
        <div>
          <label
            htmlFor="link"
            className="block text-sm font-medium text-gray-700"
          >
            Event Link
          </label>
          <input
            id="link"
            type="url"
            {...register("link")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          {errors.link && (
            <p className="text-red-500 text-sm mt-1">{errors.link?.message}</p>
          )}
        </div>

        {/* Image Upload */}
        <div>
          <label
            htmlFor="image"
            className="block text-sm font-medium text-gray-700"
          >
            Upload Image
          </label>
          <input
            id="image"
            type="file"
            {...register("image")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          {errors.image && (
            <p className="text-red-500 text-sm mt-1">
              {errors.image.message as string}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Event"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEventPage;
