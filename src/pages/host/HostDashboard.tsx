
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, PlusCircle, Utensils, Home as HomeIcon, Star,
  RefreshCw, DollarSign, Users, Calendar, Hotel, MessageCircle
} from "lucide-react"; // Added missing icons
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Added missing components
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getHostExperiences, getHostStays } from "@/services/hostService";

interface HostFoodExperience {
  id: string;
  title: string;
  description: string;
  status: "published" | "archived" | "draft";
  images: {
    id: any;
    url: any;
    order: any;
    is_primary: any;
  }[];
  price_per_person: number;
  cuisine_type: string;
  menu_description: string;
  location_name: string;
  created_at: string;
  updated_at: string;
  details: {
    duration: string;
    groupSize: string;
    includes: string[];
    language: string;
    location: string;
  };
}

interface HostStay {
  id: string;
  title: string;
  description: string;
  status: "published" | "archived" | "draft";
  images: {
    id: any;
    url: any;
    order: any;
    is_primary: any;
  }[];
  price_per_night: number;
  property_type: string;
  location_name: string;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  created_at: string;
  updated_at: string;
  details: {
    bedrooms: number;
    bathrooms: number;
    beds: number;
    maxGuests: number;
    propertyType: string;
    amenities: string[];
    location: string;
  };
}

export default function HostDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [foodExperiences, setFoodExperiences] = useState<HostFoodExperience[]>([]);
  const [stays, setStays] = useState<HostStay[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("listings"); // Added missing state
  
  // Add missing handler functions
  const handleFoodExperienceStatusChange = (id: string, status: "published" | "archived" | "draft") => {
    console.log(`Changing food experience ${id} status to ${status}`);
    // Implementation would update status in database
  };
  
  const handleStayStatusChange = (id: string, status: "published" | "archived" | "draft") => {
    console.log(`Changing stay ${id} status to ${status}`);
    // Implementation would update status in database
  };
  
  const handleDeleteFoodExperience = (id: string) => {
    console.log(`Deleting food experience ${id}`);
    // Implementation would delete from database
  };
  
  const handleDeleteStay = (id: string) => {
    console.log(`Deleting stay ${id}`);
    // Implementation would delete from database
  };
  
  const ConversationsList = () => {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">Your conversations will appear here</p>
      </div>
    );
  };
  
  useEffect(() => {
    const fetchHostData = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        
        // Fetch food experiences
        const foodData = await getHostExperiences(user.id);
        if (foodData) {
          // Process to ensure status is valid enum value and add missing details property
          const processedFoodData = foodData.map(item => ({
            ...item,
            status: (item.status as "published" | "archived" | "draft") || "draft",
            images: item.food_experience_images || [],
            details: {
              duration: item.duration || '2 hours',
              groupSize: `Max ${item.max_guests || 8} guests`,
              includes: ['Food', 'Beverages'],
              language: item.language || 'English',
              location: `${item.city}, ${item.state}`,
            }
          })) as HostFoodExperience[];
          
          setFoodExperiences(processedFoodData);
        }
        
        // Fetch stays
        const staysData = await getHostStays(user.id);
        if (staysData) {
          // Process to ensure status is valid enum value and add missing details property
          const processedStaysData = staysData.map(item => ({
            ...item,
            status: (item.status as "published" | "archived" | "draft") || "draft",
            images: item.stay_images || [],
            details: {
              bedrooms: item.bedrooms || 1,
              bathrooms: item.bathrooms || 1, 
              beds: item.beds || 1,
              maxGuests: item.max_guests || 2,
              propertyType: item.property_type || 'apartment',
              amenities: typeof item.amenities === 'string' 
                ? item.amenities.split(',')
                : ['Wi-Fi', 'Kitchen'],
              location: item.location_name || `${item.city}, ${item.state}`
            }
          })) as HostStay[];
          
          setStays(processedStaysData);
        }
      } catch (error) {
        console.error('Error fetching host data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHostData();
  }, [user]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  const foodExperiencePublished = foodExperiences.filter(exp => exp.status === 'published').length;
  const foodExperienceDraft = foodExperiences.filter(exp => exp.status === 'draft').length;
  const foodExperienceArchived = foodExperiences.filter(exp => exp.status === 'archived').length;
  
  const staysPublished = stays.filter(stay => stay.status === 'published').length;
  const staysDraft = stays.filter(stay => stay.status === 'draft').length;
  const staysArchived = stays.filter(stay => stay.status === 'archived').length;
  
  const totalPublished = foodExperiencePublished + staysPublished;
  const totalDraft = foodExperienceDraft + staysDraft;
  const totalArchived = foodExperienceArchived + staysArchived;
  const totalListings = foodExperiences.length + stays.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-terracotta-50 p-6">
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Host Dashboard</h1>
            <p className="text-gray-600">Manage your food experiences, stays, and messages</p>
          </div>
          <div className="space-x-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <HomeIcon className="w-4 h-4" />
              Back to Home
            </Button>
            <Button 
              onClick={() => navigate('/host/food/new')}
              className="flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              New Experience
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Listings</p>
                <p className="text-2xl font-bold">
                  {totalPublished}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Draft Listings</p>
                <p className="text-2xl font-bold">
                  {totalDraft}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Listings</p>
                <p className="text-2xl font-bold">
                  {totalListings}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Archived</p>
                <p className="text-2xl font-bold">
                  {totalArchived}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Dashboard Sections */}
      <div className="max-w-7xl mx-auto">
        <Tabs defaultValue="listings" onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="listings" className="flex items-center gap-2">
              <Hotel className="w-4 h-4" />
              Listings
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Messages
            </TabsTrigger>
          </TabsList>

          <TabsContent value="listings">
            {/* Food Experiences Section */}
            <div className="mb-8">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                      <Utensils className="w-5 h-5" />
                      Food Experiences
                    </CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate('/host/food/new')}
                      className="flex items-center gap-2"
                    >
                      Add New <PlusCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="divide-y">
                    {foodExperiences.length > 0 ? (
                      foodExperiences.map((exp) => (
                        <div 
                          key={exp.id}
                          className="py-4 flex flex-wrap md:flex-nowrap items-center justify-between hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <div className="flex-1 mb-2 md:mb-0" onClick={() => navigate(`/host/food/edit/${exp.id}`)}>
                            <h3 className="font-medium cursor-pointer">{exp.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>${exp.price_per_person} per person</span>
                              <Badge className={getStatusColor(exp.status)}>
                                {exp.status.charAt(0).toUpperCase() + exp.status.slice(1)}
                              </Badge>
                              {exp.created_at && (
                                <span>Created: {formatDate(exp.created_at)}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 w-full md:w-auto">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/food/${exp.id}`)}
                            >
                              Preview
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/host/food/edit/${exp.id}`)}
                            >
                              Edit
                            </Button>
                            
                            {exp.status === 'draft' && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleFoodExperienceStatusChange(exp.id, 'published')}
                                className="text-green-600"
                              >
                                <RefreshCw className="h-4 w-4 mr-1" />
                                Publish
                              </Button>
                            )}

                            {exp.status === 'published' && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleFoodExperienceStatusChange(exp.id, 'archived')}
                                className="text-gray-600"
                              >
                                <RefreshCw className="h-4 w-4 mr-1" />
                                Archive
                              </Button>
                            )}

                            {exp.status === 'archived' && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleFoodExperienceStatusChange(exp.id, 'published')}
                                className="text-green-600"
                              >
                                <RefreshCw className="h-4 w-4 mr-1" />
                                Republish
                              </Button>
                            )}

                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteFoodExperience(exp.id)}
                              className="text-red-600"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center">
                        <Utensils className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-lg font-medium text-gray-900 mb-1">No food experiences yet</p>
                        <p className="text-gray-500 mb-4">Create your first food experience to get started</p>
                        <Button onClick={() => navigate('/host/food/new')}>
                          Create Food Experience
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Stays Section */}
            <div>
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                      <Hotel className="w-5 h-5" />
                      Stays
                    </CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate('/host/stay/new')}
                      className="flex items-center gap-2"
                    >
                      Add New <PlusCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="divide-y">
                    {stays.length > 0 ? (
                      stays.map((stay) => (
                        <div 
                          key={stay.id}
                          className="py-4 flex flex-wrap md:flex-nowrap items-center justify-between hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <div className="flex-1 mb-2 md:mb-0" onClick={() => navigate(`/host/stay/${stay.id}`)}>
                            <h3 className="font-medium cursor-pointer">{stay.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>${stay.price_per_night} per night</span>
                              <Badge className={getStatusColor(stay.status)}>
                                {stay.status.charAt(0).toUpperCase() + stay.status.slice(1)}
                              </Badge>
                              {stay.created_at && (
                                <span>Created: {formatDate(stay.created_at)}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 w-full md:w-auto">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/stay/${stay.id}`)}
                            >
                              Preview
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/host/stay/${stay.id}`)}
                            >
                              Edit
                            </Button>
                            
                            {stay.status === 'draft' && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleStayStatusChange(stay.id, 'published')}
                                className="text-green-600"
                              >
                                <RefreshCw className="h-4 w-4 mr-1" />
                                Publish
                              </Button>
                            )}

                            {stay.status === 'published' && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleStayStatusChange(stay.id, 'archived')}
                                className="text-gray-600"
                              >
                                <RefreshCw className="h-4 w-4 mr-1" />
                                Archive
                              </Button>
                            )}

                            {stay.status === 'archived' && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleStayStatusChange(stay.id, 'published')}
                                className="text-green-600"
                              >
                                <RefreshCw className="h-4 w-4 mr-1" />
                                Republish
                              </Button>
                            )}

                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteStay(stay.id)}
                              className="text-red-600"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center">
                        <Hotel className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-lg font-medium text-gray-900 mb-1">No stays yet</p>
                        <p className="text-gray-500 mb-4">Create your first stay to get started</p>
                        <Button onClick={() => navigate('/host/stay/new')}>
                          Create Stay
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Messages
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[600px]">
                  <ConversationsList />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
