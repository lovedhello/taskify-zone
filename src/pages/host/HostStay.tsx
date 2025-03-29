import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { PlusCircle, Loader2, ImagePlus, Trash2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  createStay,
  getStayById,
  updateStay,
  uploadStayImage,
  deleteStayImage,
  setStayPrimaryImage,
} from "@/services/hostService";
import { Stay } from "@/services/stayService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

const stayFormSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  address: z.string().min(5, {
    message: "Address must be at least 5 characters.",
  }),
  zipcode: z.string().min(5, {
    message: "Zip code must be at least 5 characters.",
  }),
  city: z.string().min(2, {
    message: "City must be at least 2 characters.",
  }),
  state: z.string().min(2, {
    message: "State must be at least 2 characters.",
  }),
  latitude: z.number(),
  longitude: z.number(),
  location_name: z.string().min(2, {
    message: "Location name must be at least 2 characters.",
  }),
  amenities: z.array(z.string()).optional(),
  status: z.enum(["published", "draft"]),
  price_per_night: z.number(),
  bedrooms: z.number(),
  bathrooms: z.number(),
  beds: z.number(),
  max_guests: z.number(),
  property_type: z.string(),
  is_featured: z.boolean().default(false),
});

export default function HostStay() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [stay, setStay] = useState<Stay | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<
    { id: string; url: string; isPrimary: boolean }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteImageOpen, setIsDeleteImageOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const [isPrimaryImageSetting, setIsPrimaryImageSetting] = useState(false);

  const form = useForm<z.infer<typeof stayFormSchema>>({
    resolver: zodResolver(stayFormSchema),
    defaultValues: {
      title: "",
      description: "",
      address: "",
      zipcode: "",
      city: "",
      state: "",
      latitude: 0,
      longitude: 0,
      location_name: "",
      amenities: [],
      status: "draft",
      price_per_night: 0,
      bedrooms: 1,
      bathrooms: 1,
      beds: 1,
      max_guests: 2,
      property_type: "apartment",
      is_featured: false,
    },
  });

  useEffect(() => {
    const fetchStay = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const stayData = await getStayById(id);

        if (stayData) {
          setStay(stayData);
          form.reset({
            title: stayData.title,
            description: stayData.description,
            address: stayData.address,
            zipcode: stayData.zipcode,
            city: stayData.city,
            state: stayData.state,
            latitude: stayData.latitude,
            longitude: stayData.longitude,
            location_name: stayData.location_name,
            amenities: stayData.details.amenities,
            status: stayData.status as "published" | "draft",
            price_per_night: stayData.price_per_night,
            bedrooms: stayData.details.bedrooms,
            bathrooms: stayData.details.bathrooms,
            beds: stayData.details.beds,
            max_guests: stayData.details.maxGuests,
            property_type: stayData.details.propertyType || "apartment",
            is_featured: stayData.is_featured || false,
          });

          // Load existing images
          if (stayData.images && stayData.images.length > 0) {
            const loadedImages = stayData.images.map((img) => ({
              id: img.id || "",
              url: img.url,
              isPrimary: img.is_primary || false,
            }));
            setImages(loadedImages);
          }
        }
      } catch (error) {
        console.error("Error fetching stay:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStay();
    } else {
      setLoading(false);
    }
  }, [id, form]);

  const handleImageUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;

    try {
      setIsSubmitting(true);
      const uploadedImage = await uploadStayImage(id, file);

      if (uploadedImage) {
        setImages((prevImages) => [
          ...prevImages,
          {
            id: uploadedImage.id,
            url: uploadedImage.image_path,
            isPrimary: false,
          },
        ]);
        toast({
          title: "Image uploaded successfully!",
        });
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Failed to upload image.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetPrimaryImage = async (imageId: string) => {
    if (!id) return;

    try {
      setIsPrimaryImageSetting(true);
      await setStayPrimaryImage(id, imageId);

      // Update local state
      setImages((prevImages) =>
        prevImages.map((img) => ({
          ...img,
          isPrimary: img.id === imageId,
        }))
      );
      toast({
        title: "Primary image updated successfully!",
      });
    } catch (error) {
      console.error("Error setting primary image:", error);
      toast({
        title: "Failed to set primary image.",
        variant: "destructive",
      });
    } finally {
      setIsPrimaryImageSetting(false);
    }
  };

  const confirmDeleteImage = (imageId: string) => {
    setImageToDelete(imageId);
    setIsDeleteImageOpen(true);
  };

  const handleDeleteImage = async () => {
    if (!imageToDelete) return;

    try {
      setIsSubmitting(true);
      await deleteStayImage(imageToDelete);

      // Update local state
      setImages((prevImages) =>
        prevImages.filter((img) => img.id !== imageToDelete)
      );
      toast({
        title: "Image deleted successfully!",
      });
    } catch (error) {
      console.error("Error deleting image:", error);
      toast({
        title: "Failed to delete image.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setIsDeleteImageOpen(false);
      setImageToDelete(null);
    }
  };

  const onSubmit = async (values: z.infer<typeof stayFormSchema>) => {
    try {
      setIsSubmitting(true);

      const stayData = {
        ...values,
        bedrooms: Number(values.bedrooms),
        bathrooms: Number(values.bathrooms),
        beds: Number(values.beds),
        max_guests: Number(values.max_guests),
        price_per_night: Number(values.price_per_night),
        amenities: values.amenities,
        host_id: user?.id,
      };

      if (id) {
        await updateStay(id, stayData);
        toast({
          title: "Stay updated successfully!",
        });
      } else {
        await createStay(stayData);
        toast({
          title: "Stay created successfully!",
        });
        navigate("/host/dashboard");
      }
    } catch (error) {
      console.error("Error creating/updating stay:", error);
      toast({
        title: "Failed to create/update stay.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin h-10 w-10" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-4">
        {id ? "Edit Stay" : "Create Stay"}
      </h1>
      <Separator className="mb-6" />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 divide-y divide-gray-200"
        >
          <div className="space-y-8 divide-y divide-gray-200 sm:space-y-5">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Listing Information
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Basic information about your stay listing.
              </p>
            </div>
            <div className="mt-6 sm:mt-5 divide-y divide-gray-200">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-6">
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input type="text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-6">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea rows={4} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-3">
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input type="text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="zipcode"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-3">
                      <FormLabel>Zip Code</FormLabel>
                      <FormControl>
                        <Input type="text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-3">
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input type="text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-3">
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input type="text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-3">
                      <FormLabel>Latitude</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-3">
                      <FormLabel>Longitude</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location_name"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-6">
                      <FormLabel>Location Name</FormLabel>
                      <FormControl>
                        <Input type="text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="property_type"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-3">
                      <FormLabel>Property Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a property type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="apartment">Apartment</SelectItem>
                          <SelectItem value="house">House</SelectItem>
                          <SelectItem value="cabin">Cabin</SelectItem>
                          <SelectItem value="room">Room</SelectItem>
                          <SelectItem value="cottage">Cottage</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price_per_night"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-3">
                      <FormLabel>Price per Night</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bedrooms"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Bedrooms</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bathrooms"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Bathrooms</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="beds"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Beds</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="max_guests"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-3">
                      <FormLabel>Max Guests</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amenities"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-6">
                      <FormLabel>Amenities</FormLabel>
                      <div className="flex flex-wrap gap-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="wifi"
                            checked={field.value?.includes("Wi-Fi")}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange([...(field.value || []), "Wi-Fi"]);
                              } else {
                                field.onChange(
                                  field.value?.filter((v) => v !== "Wi-Fi")
                                );
                              }
                            }}
                          />
                          <Label htmlFor="wifi">Wi-Fi</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="kitchen"
                            checked={field.value?.includes("Kitchen")}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange([...(field.value || []), "Kitchen"]);
                              } else {
                                field.onChange(
                                  field.value?.filter((v) => v !== "Kitchen")
                                );
                              }
                            }}
                          />
                          <Label htmlFor="kitchen">Kitchen</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="parking"
                            checked={field.value?.includes("Free parking")}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange([
                                  ...(field.value || []),
                                  "Free parking",
                                ]);
                              } else {
                                field.onChange(
                                  field.value?.filter((v) => v !== "Free parking")
                                );
                              }
                            }}
                          />
                          <Label htmlFor="parking">Free parking</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="ac"
                            checked={field.value?.includes("Air conditioning")}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange([
                                  ...(field.value || []),
                                  "Air conditioning",
                                ]);
                              } else {
                                field.onChange(
                                  field.value?.filter((v) => v !== "Air conditioning")
                                );
                              }
                            }}
                          />
                          <Label htmlFor="ac">Air conditioning</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="pets"
                            checked={field.value?.includes("Pets allowed")}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange([
                                  ...(field.value || []),
                                  "Pets allowed",
                                ]);
                              } else {
                                field.onChange(
                                  field.value?.filter((v) => v !== "Pets allowed")
                                );
                              }
                            }}
                          />
                          <Label htmlFor="pets">Pets allowed</Label>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-3">
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_featured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 sm:col-span-3">
                      <div className="space-y-0.5">
                        <FormLabel>Featured Stay</FormLabel>
                        <FormDescription>
                          Mark this stay as featured on the homepage.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          <div className="pt-8">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Images
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Upload images to showcase your stay.
            </p>

            <div className="mt-4">
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                className="sr-only"
                onChange={handleImageUpload}
              />
              <Label htmlFor="image-upload" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                <ImagePlus className="mr-2 h-5 w-5" />
                Upload Image
              </Label>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {images.map((image) => (
                <Card key={image.id}>
                  <CardContent className="p-2">
                    <AspectRatio ratio={4 / 3}>
                      <img
                        src={image.url}
                        alt="Stay Image"
                        className="object-cover rounded-md"
                      />
                    </AspectRatio>
                    <div className="flex items-center justify-between mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetPrimaryImage(image.id)}
                        disabled={isPrimaryImageSetting}
                      >
                        {image.isPrimary ? "Primary" : "Set Primary"}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently
                              delete the image from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => confirmDeleteImage(image.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="pt-5">
            <div className="flex justify-end">
              <Button
                variant="ghost"
                className="mr-3"
                onClick={() => navigate("/host/dashboard")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    Saving...
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>

      <AlertDialog open={isDeleteImageOpen} onOpenChange={setIsDeleteImageOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              image from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteImage}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
