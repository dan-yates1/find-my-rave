"use client";

import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { createEventSchema, CreateEventFormData } from "@/lib/validation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getLatLon } from "@/lib/utils";
import { AlertCircle, CheckCircle2 } from "lucide-react";

const CreateEventPage: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const suggestionsRef = useRef<HTMLUListElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [hasFocus, setHasFocus] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventSchema),
  });

  const location = watch("location");

  useEffect(() => {
    const fetchLocationSuggestions = async () => {
      if (location && location.length > 2) {
        try {
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
              location
            )}.json?access_token=${
              process.env.NEXT_PUBLIC_MAPBOX_API_KEY
            }&types=place,address&limit=5`
          );
          const data = await response.json();
          const suggestions = data.features.map(
            (feature: any) => feature.place_name
          );
          setLocationSuggestions(suggestions);
        } catch (error) {
          console.error("Error fetching location suggestions:", error);
        }
      } else {
        setLocationSuggestions([]);
      }
    };

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(fetchLocationSuggestions, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setLocationSuggestions([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSuggestionClick = (suggestion: string) => {
    setValue("location", suggestion);
    setHasFocus(false);
    setLocationSuggestions([]);
  };

  const onSubmit = async (data: CreateEventFormData) => {
    setLoading(true);

    try {
      // Fetch latitude and longitude based on location
      const result = await getLatLon(data.location);
      const latitude = result?.lat ?? 0;
      const longitude = result?.lon ?? 0;
      data.latitude = latitude;
      data.longitude = longitude;

      let imageUrl = "";

      if (data.image && data.image.length > 0) {
        const formData = new FormData();
        formData.append("file", data.image[0]);

        const uploadResponse = await fetch("/api/upload-image", {
          method: "POST",
          body: formData,
        });

        const uploadResult = await uploadResponse.json();
        imageUrl = uploadResult.imageUrl;
      }

      // Include imageUrl in the initial event creation
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...data, imageUrl }),
      });

      if (!response.ok) {
        throw new Error("Failed to create event");
      }

      setNotification({
        type: "success",
        message: "Event created successfully!",
      });
      setTimeout(() => {
        router.push("/find-events");
      }, 2000);
    } catch (error) {
      console.error("An error occurred:", error);
      setNotification({
        type: "error",
        message: "Failed to create event. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="max-w-5xl mx-auto py-10 border rounded-lg p-4 m-10">
        {notification && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 transition-opacity" />
            <div
              className={`p-4 rounded-md shadow-lg ${
                notification.type === "success"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              } flex items-center space-x-2`}
            >
              {notification.type === "success" ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <span>{notification.message}</span>
            </div>
          </div>
        )}

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
            <Input
              id="title"
              type="text"
              {...register("title")}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">
                {errors.title.message}
              </p>
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
            <Textarea
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
            <Input
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
            <Input
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
          <div className="relative">
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700"
            >
              Location
            </label>
            <Input
              id="location"
              type="text"
              onFocus={() => setHasFocus(true)}
              {...register("location")}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
            {errors.location && (
              <p className="text-red-500 text-sm mt-1">
                {errors.location?.message}
              </p>
            )}
            {hasFocus && locationSuggestions.length > 0 && (
              <ul className="absolute left-0 right-0 bg-white rounded-lg shadow-lg mt-2 z-20">
                {locationSuggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100 focus:bg-gray-100 focus:outline-none border-b border-gray-200 last:border-none"
                  >
                    <div className="font-semibold">{suggestion}</div>
                    <div className="text-sm text-gray-500">{suggestion}</div>
                  </li>
                ))}
              </ul>
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
            <Input
              id="link"
              type="url"
              {...register("link")}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
            {errors.link && (
              <p className="text-red-500 text-sm mt-1">
                {errors.link?.message}
              </p>
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
            <Input
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
    </>
  );
};

export default CreateEventPage;
