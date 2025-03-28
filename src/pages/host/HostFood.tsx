import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft, 
  Home, 
  Utensils, 
  Trash2, 
  Plus, 
  UploadCloud, 
  X,
  Loader2
} from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

import { 
  createFoodExperience, 
  updateFoodExperience, 
  uploadFoodExperienceImage, 
  deleteFoodExperienceImage 
} from "@/services/hostService";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  cuisine_type: z.string().min(1, "Please select a cuisine type"),
  price_per_person: z.coerce.number().min(1, "Price must be at least 1"),
  menu_description: z.string().min(20, "Menu description must be at least 20 characters"),
  location_name: z.string().min(5, "Location name must be at least 5 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "State must be at least 2 characters"),
  duration: z.string().min(1, "Please select a duration"),
  max_guests: z.coerce.number().min(1, "Maximum guests must be at least 1"),
  language: z.string().min(1, "Please select a language")
});

type FormValues = z.infer<typeof formSchema>;

const HostFood = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<Array<{ id: string; url: string; is_primary: boolean }>>([]);
  const [uploading, setUploading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      cuisine_type: "",
      price_per_person: 0,
      menu_description: "",
      location_name: "",
      address: "",
      city: "",
      state: "",
      duration: "2 hours",
      max_guests: 8,
      language: "English"
    }
  });

  useEffect(() => {
    const fetchExperience = async () => {
      if (!id) {
        setIsEdit(false);
        return;
      }

      try {
        setLoading(true);
        setIsEdit(true);
        
        // In a real implementation, we would fetch the food experience data
        // and set up the form values and images
        
        // Simulating with a timeout
        setTimeout(() => {
          // This is placeholder code - we would normally get this from the backend
          if (id === "new") {
            setIsEdit(false);
            return;
          }
          
          form.reset({
            title: "Sample Experience",
            description: "This is a sample description for a food experience...",
            cuisine_type: "Italian",
            price_per_person: 25,
            menu_description: "Appetizer: Bruschetta\nMain: Pasta Carbonara\nDessert: Tiramisu",
            location_name: "Italian Kitchen",
            address: "123 Main St",
            city: "New York",
            state: "NY",
            duration: "2 hours",
            max_guests: 8,
            language: "English"
          });
          
          // Remove the sample images as they're causing UUID format errors
          setImages([]);
          
          setLoading(false);
        }, 1000);
        
      } catch (error) {
        console.error("Error fetching experience:", error);
        toast.error("Failed to load experience data");
        setLoading(false);
      }
    };

    fetchExperience();
  }, [id, form]);

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);
      
      if (isEdit && id && id !== "new") {
        await updateFoodExperience(id, {
          ...data,
          details: {
            duration: data.duration,
            groupSize: `Max ${data.max_guests} guests`,
            includes: ["Food", "Beverages"],
            language: data.language,
            location: `${data.city}, ${data.state}`
          }
        });
        toast.success("Food experience updated successfully");
      } else {
        const newExperience = await createFoodExperience({
          ...data,
          details: {
            duration: data.duration,
            groupSize: `Max ${data.max_guests} guests`,
            includes: ["Food", "Beverages"],
            language: data.language,
            location: `${data.city}, ${data.state}`
          }
        });
        
        // Refresh user data to update host status in the UI
        await refreshUser();
        
        toast.success("Food experience created successfully");
        
        // Navigate to the edit page for the new experience
        const experienceWithId = newExperience as { id: string | number };
        if (experienceWithId && experienceWithId.id) {
          navigate(`/host/food/edit/${experienceWithId.id}`);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error saving experience:", error);
      toast.error("Failed to save experience");
      setLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !id || id === "new") {
      toast.error("Please create the experience before uploading images");
      return;
    }

    try {
      setUploading(true);
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isPrimary = images.length === 0;
        
        await uploadFoodExperienceImage(id, file, isPrimary);
      }
      
      // Refresh images
      // In a real implementation, we would fetch the updated images
      
      toast.success("Images uploaded successfully");
      setUploading(false);
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error("Failed to upload images");
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!imageId) return;
    
    try {
      await deleteFoodExperienceImage(imageId);
      setImages(prev => prev.filter(img => img.id !== imageId));
      toast.success("Image deleted successfully");
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image");
    }
  };

  const cuisineTypes = [
    "Italian", "French", "Japanese", "Chinese", "Mexican", 
    "Indian", "Thai", "American", "Mediterranean", "Middle Eastern",
    "Spanish", "Greek", "Vietnamese", "Korean", "Brazilian",
    "Ethiopian", "Lebanese", "Moroccan", "Turkish", "Other"
  ];

  const durations = [
    "1 hour", "1.5 hours", "2 hours", "2.5 hours", "3 hours", 
    "3.5 hours", "4 hours", "4.5 hours", "5 hours", "More than 5 hours"
  ];

  const languages = [
    "English", "Spanish", "French", "German", "Italian", 
    "Portuguese", "Japanese", "Chinese", "Korean", "Arabic",
    "Russian", "Hindi", "Other"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-terracotta-50 p-6">
      <div className="max-w-5xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate("/host/dashboard")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEdit ? "Edit Food Experience" : "Create Food Experience"}
            </h1>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Home
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="w-5 h-5" />
              Food Experience Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Authentic Italian Pasta Making" {...field} />
                        </FormControl>
                        <FormDescription>
                          Create a catchy title for your experience
                        </FormDescription>
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
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a cuisine type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {cuisineTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The primary cuisine style of your experience
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your food experience in detail..."
                            className="min-h-32"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Provide a detailed description of what guests can expect
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price_per_person"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price Per Person</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                              $
                            </span>
                            <Input
                              type="number"
                              className="pl-8"
                              placeholder="25"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          How much will you charge per guest
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="max_guests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Guests</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="8" {...field} />
                        </FormControl>
                        <FormDescription>
                          The maximum number of guests you can accommodate
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select experience duration" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {durations.map((duration) => (
                              <SelectItem key={duration} value={duration}>
                                {duration}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          How long will your experience last
                        </FormDescription>
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
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {languages.map((language) => (
                              <SelectItem key={language} value={language}>
                                {language}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Primary language for the experience
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="menu_description"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Menu Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the menu or food items in detail..."
                            className="min-h-32"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Describe the dishes or food items that will be prepared or served
                        </FormDescription>
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
                          <Input placeholder="e.g. My Home Kitchen, Downtown Restaurant" {...field} />
                        </FormControl>
                        <FormDescription>
                          The name of the location where the experience will take place
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="md:col-span-2">
                    <h3 className="text-lg font-medium mb-4">Address Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem className="md:col-span-3">
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input placeholder="123 Main St" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="San Francisco" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input placeholder="CA" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Image Upload Section */}
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4">Images</h3>
                  
                  {isEdit && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                      {images.map((image) => (
                        <div key={image.id} className="relative group rounded-lg overflow-hidden border border-gray-200 bg-white aspect-[4/3]">
                          <img 
                            src={image.url} 
                            alt="Food experience" 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                            <button 
                              onClick={() => handleDeleteImage(image.id)}
                              className="opacity-0 group-hover:opacity-100 bg-red-600 hover:bg-red-700 text-white rounded-full p-2"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                          {image.is_primary && (
                            <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded">
                              Primary
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-center">
                    <div className="relative w-full max-w-md">
                      <div className="flex items-center justify-center w-full">
                        <label 
                          htmlFor="image-upload" 
                          className={`flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            {uploading ? (
                              <>
                                <Loader2 className="w-8 h-8 text-gray-500 mb-1 animate-spin" />
                                <p className="text-sm text-gray-500">Uploading images...</p>
                              </>
                            ) : (
                              <>
                                <UploadCloud className="w-8 h-8 text-gray-500 mb-1" />
                                <p className="text-sm text-gray-500">
                                  Click to upload images or drag and drop
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  PNG, JPG, GIF up to 10MB
                                </p>
                              </>
                            )}
                          </div>
                          <input 
                            id="image-upload" 
                            type="file" 
                            className="hidden" 
                            accept="image/*" 
                            multiple
                            onChange={handleImageUpload}
                            disabled={uploading || !isEdit}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {!isEdit && (
                    <p className="text-center text-sm text-gray-500 mt-2">
                      You'll be able to upload images after creating the experience
                    </p>
                  )}
                </div>

                <div className="flex justify-end pt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate("/host/dashboard")}
                    className="mr-2"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEdit ? "Update Experience" : "Create Experience"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HostFood;