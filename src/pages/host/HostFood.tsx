
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, PlusCircle, X } from "lucide-react";
import { createFoodExperience, getFoodExperienceById, updateFoodExperience, uploadFoodExperienceImage, deleteFoodExperienceImage, setFoodExperiencePrimaryImage } from "@/services/hostService";
import { FoodExperience } from "@/types/food";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Progress } from "@/components/ui/progress";

const formSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  cuisine_type: z.string().min(3, {
    message: "Cuisine type must be at least 3 characters.",
  }),
  menu_description: z.string().min(10, {
    message: "Menu description must be at least 10 characters.",
  }),
  location_name: z.string().min(3, {
    message: "Location must be at least 3 characters.",
  }),
  address: z.string().min(3, {
    message: "Address must be at least 3 characters.",
  }),
  city: z.string().min(3, {
    message: "City must be at least 3 characters.",
  }),
  state: z.string().min(2, {
    message: "State must be at least 2 characters.",
  }),
  zipcode: z.string().min(5, {
    message: "Zipcode must be at least 5 characters.",
  }),
  latitude: z.number(),
  longitude: z.number(),
  duration: z.string().min(3, {
    message: "Duration must be at least 3 characters.",
  }),
  language: z.string().min(3, {
    message: "Language must be at least 3 characters.",
  }),
  price_per_person: z.number().min(1, {
    message: "Price must be at least $1.",
  }),
  max_guests: z.number().min(1, {
    message: "Max guests must be at least 1.",
  }),
  is_featured: z.boolean().default(false),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
});

export default function HostFood() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [foodExperience, setFoodExperience] = useState<FoodExperience | null>(null);
  const [images, setImages] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
  const [settingPrimaryImageId, setSettingPrimaryImageId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      cuisine_type: "",
      menu_description: "",
      location_name: "",
      address: "",
      city: "",
      state: "",
      zipcode: "",
      latitude: 0,
      longitude: 0,
      duration: "",
      language: "",
      price_per_person: 1,
      max_guests: 1,
      is_featured: false,
      status: "draft",
    },
  });

  useEffect(() => {
    if (!id) return;

    const fetchFoodExperience = async () => {
      try {
        const data = await getFoodExperienceById(id);
        if (data) {
          setFoodExperience(data);
          form.reset({
            title: data.title,
            description: data.description,
            cuisine_type: data.cuisine_type,
            menu_description: data.menu_description,
            location_name: data.location_name,
            address: data.details.location,
            city: data.details.location.split(",")[0],
            state: data.details.location.split(",")[1],
            zipcode: data.zipcode || "",
            latitude: data.coordinates?.lat || 0,
            longitude: data.coordinates?.lng || 0,
            duration: data.details.duration,
            language: data.details.language,
            price_per_person: data.price_per_person,
            max_guests: parseInt(data.details.groupSize.replace("Max ", "").replace(" guests", "")),
            is_featured: data.is_featured || false,
            status: data.status || "draft",
          });
          setImages(data.images);
        }
      } catch (error) {
        console.error("Error fetching food experience:", error);
      }
    };

    fetchFoodExperience();
  }, [id, form]);

  const handleCreateFoodExperience = async (foodData: any) => {
    try {
      setIsSubmitting(true);

      // Remove the details property as it doesn't exist in the DB table schema
      const { details, ...foodDataForDb } = foodData;

      // Pass only the properties that match the database schema
      const createdExperience = await createFoodExperience(foodDataForDb);

      if (createdExperience) {
        toast({
          title: "Success",
          description: "Food experience created successfully!",
        });
        navigate("/host/dashboard");
      } else {
        toast({
          title: "Error",
          description: "Failed to create food experience.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating food experience:", error);
      toast({
        title: "Error",
        description: "Failed to create food experience.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateFoodExperience = async (foodData: any) => {
    try {
      setIsSubmitting(true);

      // Remove the details property as it doesn't exist in the DB table schema
      const { details, ...foodDataForDb } = foodData;

      // Pass only the properties that match the database schema
      await updateFoodExperience(id!, foodDataForDb);

      toast({
        title: "Success",
        description: "Food experience updated successfully!",
      });
      navigate("/host/dashboard");
    } catch (error) {
      console.error("Error updating food experience:", error);
      toast({
        title: "Error",
        description: "Failed to update food experience.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const foodData = {
      ...values,
      host_id: user?.id,
    };

    if (id) {
      await handleUpdateFoodExperience(foodData);
    } else {
      await handleCreateFoodExperience(foodData);
    }
  };

  const handleImageUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      if (!id) {
        toast({
          title: "Error",
          description: "Please create the food experience first before uploading images.",
          variant: "destructive",
        });
        return;
      }

      const imageRecord = await uploadFoodExperienceImage(id, file, false, images.length);
      if (imageRecord) {
        setImages([...images, imageRecord]);
        toast({
          title: "Success",
          description: "Image uploaded successfully!",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to upload image.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error",
        description: "Failed to upload image.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    setDeletingImageId(imageId);

    try {
      await deleteFoodExperienceImage(imageId);
      setImages(images.filter((image) => image.id !== imageId));
      toast({
        title: "Success",
        description: "Image deleted successfully!",
      });
    } catch (error) {
      console.error("Error deleting image:", error);
      toast({
        title: "Error",
        description: "Failed to delete image.",
        variant: "destructive",
      });
    } finally {
      setDeletingImageId(null);
    }
  };

  const handleSetPrimaryImage = async (imageId: string) => {
    setSettingPrimaryImageId(imageId);

    try {
      await setFoodExperiencePrimaryImage(id!, imageId);
      setImages(
        images.map((image) => ({
          ...image,
          is_primary: image.id === imageId,
        }))
      );
      toast({
        title: "Success",
        description: "Primary image set successfully!",
      });
    } catch (error) {
      console.error("Error setting primary image:", error);
      toast({
        title: "Error",
        description: "Failed to set primary image.",
        variant: "destructive",
      });
    } finally {
      setSettingPrimaryImageId(null);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>{id ? "Edit Food Experience" : "Create Food Experience"}</CardTitle>
          <CardDescription>
            {id ? "Update your food experience details here." : "Create a new food experience for others to enjoy."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Title of your food experience" {...field} />
                  </FormControl>
                  <FormDescription>This is the title that will be displayed to users.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Description of your food experience" {...field} />
                  </FormControl>
                  <FormDescription>Briefly describe what makes your food experience unique.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cuisine_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cuisine Type</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Italian, Mexican, Japanese" {...field} />
                  </FormControl>
                  <FormDescription>Specify the type of cuisine offered.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="menu_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Menu Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the menu for your food experience" {...field} />
                  </FormControl>
                  <FormDescription>Provide details about the dishes included in the experience.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., My Kitchen, Rooftop Terrace" {...field} />
                  </FormControl>
                  <FormDescription>Name of the location where the experience will take place.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Street address" {...field} />
                  </FormControl>
                  <FormDescription>Street address of the location.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="City" {...field} />
                    </FormControl>
                    <FormDescription>City of the location.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input placeholder="State" {...field} />
                    </FormControl>
                    <FormDescription>State of the location.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="zipcode"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Zipcode</FormLabel>
                    <FormControl>
                      <Input placeholder="Zipcode" {...field} />
                    </FormControl>
                    <FormDescription>Zipcode of the location.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="latitude"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Latitude</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Latitude" {...field} />
                    </FormControl>
                    <FormDescription>Latitude of the location.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="longitude"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Longitude</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Longitude" {...field} />
                    </FormControl>
                    <FormDescription>Longitude of the location.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 2 hours, 30 minutes" {...field} />
                  </FormControl>
                  <FormDescription>Duration of the food experience.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Language</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., English, Spanish, French" {...field} />
                  </FormControl>
                  <FormDescription>Language in which the experience will be conducted.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price_per_person"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price per Person</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Price per person" {...field} />
                  </FormControl>
                  <FormDescription>Price per person for the food experience.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="max_guests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Guests</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Maximum number of guests" {...field} />
                  </FormControl>
                  <FormDescription>Maximum number of guests allowed for the experience.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="is_featured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Featured</FormLabel>
                    <FormDescription>
                      Mark this experience as featured.
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
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Set the status of the food experience.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Separator />
            <div>
              <Label>Images</Label>
              <p className="text-sm text-muted-foreground">Upload images to showcase your food experience.</p>
              <Input type="file" accept="image/*" onChange={handleImageUpload} className="mt-2" />
              {uploading && (
                <Progress value={uploadProgress} className="mt-2" />
              )}
              <div className="grid grid-cols-3 gap-4 mt-4">
                {images.map((image) => (
                  <div key={image.id} className="relative">
                    <AspectRatio ratio={16 / 9}>
                      <img
                        src={image.url}
                        alt="Food Experience"
                        className="object-cover rounded-md"
                      />
                    </AspectRatio>
                    <div className="absolute top-2 right-2 flex gap-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="icon" disabled={deletingImageId === image.id}>
                            <X className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the image
                              from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteImage(image.id)}>
                              {deletingImageId === image.id ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : null}
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <Button variant="secondary" size="icon" disabled={settingPrimaryImageId === image.id} onClick={() => handleSetPrimaryImage(image.id)}>
                        {settingPrimaryImageId === image.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
