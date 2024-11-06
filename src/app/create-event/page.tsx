"use client";

import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { createEventSchema, CreateEventFormData } from "@/lib/validation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getLatLon } from "@/lib/utils";
import { AlertCircle, CheckCircle2, ImageIcon, CalendarIcon, MapPinIcon, LinkIcon } from "lucide-react";

const CreateEventPage: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
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
  const imageFile = watch("image");

  // Handle image preview
  useEffect(() => {
    if (imageFile && imageFile.length > 0) {
      const file = imageFile[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [imageFile]);

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

  const onSubmit = async (data: CreateEventFormData) => {
    setLoading(true);
    try {
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
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {notification && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
            <div className={`p-6 rounded-xl shadow-lg ${
              notification.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
              } flex items-center space-x-3`}
            >
              {notification.type === "success" ? (
                <CheckCircle2 className="h-6 w-6" />
              ) : (
                <AlertCircle className="h-6 w-6" />
              )}
              <span className="text-lg">{notification.message}</span>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h1 className="text-3xl font-bold mb-8">Create a New Event</h1>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Image Upload Section */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Event Image
              </label>
              <div className="relative">
                <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-300 px-6 py-10">
                  <div className="text-center">
                    {selectedImage ? (
                      <img
                        src={selectedImage}
                        alt="Preview"
                        className="mx-auto h-48 w-96 object-cover rounded-lg"
                      />
                    ) : (
                      <ImageIcon
                        className="mx-auto h-12 w-12 text-gray-400"
                        aria-hidden="true"
                      />
                    )}
                    <div className="mt-4 flex flex-col items-center text-sm leading-6 text-gray-600">
                      <label
                        htmlFor="image"
                        className="relative cursor-pointer rounded-md bg-white font-semibold text-primary hover:text-primary/80"
                      >
                        <span>Upload an image</span>
                        <input
                          id="image"
                          type="file"
                          className="sr-only"
                          {...register("image")}
                        />
                      </label>
                      <p className="text-xs leading-5 text-gray-600">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Title & Description */}
            <div className="grid grid-cols-1 gap-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title
                </label>
                <Input
                  {...register("title")}
                  className="w-full"
                  placeholder="Enter event title"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <Textarea
                  {...register("description")}
                  className="w-full min-h-[150px]"
                  placeholder="Describe your event"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date & Time
                </label>
                <Input
                  type="datetime-local"
                  {...register("startDate")}
                  className="w-full"
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date & Time
                </label>
                <Input
                  type="datetime-local"
                  {...register("endDate")}
                  className="w-full"
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
                )}
              </div>
            </div>

            {/* Location & Link */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <Input
                  {...register("location")}
                  onFocus={() => setHasFocus(true)}
                  className="w-full"
                  placeholder="Enter event location"
                />
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                )}
                {hasFocus && locationSuggestions.length > 0 && (
                  <ul
                    ref={suggestionsRef}
                    className="absolute z-10 w-full bg-white shadow-lg rounded-lg mt-1 border border-gray-200"
                  >
                    {locationSuggestions.map((suggestion, index) => (
                      <li
                        key={index}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setValue("location", suggestion);
                          setLocationSuggestions([]);
                          setHasFocus(false);
                        }}
                      >
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Link
                </label>
                <Input
                  {...register("link")}
                  className="w-full"
                  placeholder="https://..."
                />
                {errors.link && (
                  <p className="mt-1 text-sm text-red-600">{errors.link.message}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-primary text-white px-8 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Event"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEventPage;
