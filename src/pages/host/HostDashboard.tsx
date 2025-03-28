import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Home, Utensils, Hotel, Plus, ArrowRight, 
  DollarSign, Users, Calendar, Star, RefreshCw
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Import our service function
import { getHostFoodExperiences, changeFoodExperienceStatus, deleteFoodExperience } from "@/services/hostService";

// Define a type that matches what the backend returns
interface HostFoodExperience {
  id: string | number;
  title: string;
  description: string;
  status: 'draft' | 'published' | 'archived';
  images: {
    id: string;
    url: string;
    order: number;
    is_primary: boolean;
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

const HostDashboard = () => {
  const navigate = useNavigate();
  const [foodExperiences, setFoodExperiences] = useState<HostFoodExperience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFoodExperiences();
  }, []);

  const fetchFoodExperiences = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getHostFoodExperiences();
      setFoodExperiences(data);
    } catch (err) {
      console.error('Error fetching food experiences:', err);
      setError('Failed to load your food experiences. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string | number, status: 'draft' | 'published' | 'archived') => {
    try {
      await changeFoodExperienceStatus(id.toString(), status);
      // Update local state
      setFoodExperiences(prev => 
        prev.map(exp => 
          exp.id === id ? { ...exp, status } : exp
        )
      );
    } catch (err) {
      console.error('Error changing status:', err);
      setError('Failed to update status. Please try again.');
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm('Are you sure you want to delete this food experience? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteFoodExperience(id.toString());
      // Remove from local state
      setFoodExperiences(prev => prev.filter(exp => exp.id !== id));
    } catch (err) {
      console.error('Error deleting food experience:', err);
      setError('Failed to delete food experience. Please try again.');
    }
  };

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-terracotta-50 p-6">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Host Dashboard</h1>
            <p className="text-gray-600">Manage your food experiences and stays</p>
          </div>
          <div className="space-x-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Button>
            <Button 
              onClick={() => navigate('/host/food/new')}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Experience
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-8 max-w-7xl mx-auto">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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
                  {foodExperiences.filter(exp => exp.status === 'published').length}
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
                  {foodExperiences.filter(exp => exp.status === 'draft').length}
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
                  {foodExperiences.length}
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
                  {foodExperiences.filter(exp => exp.status === 'archived').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Food Experiences Section */}
      <div className="max-w-7xl mx-auto mb-8">
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
                Add New <Plus className="w-4 h-4" />
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
                          onClick={() => handleStatusChange(exp.id, 'published')}
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
                          onClick={() => handleStatusChange(exp.id, 'archived')}
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
                          onClick={() => handleStatusChange(exp.id, 'published')}
                          className="text-green-600"
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Republish
                        </Button>
                      )}

                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(exp.id)}
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
      <div className="max-w-7xl mx-auto">
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
                Add New <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="py-8 text-center">
              <Hotel className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-1">Stay listings coming soon</p>
              <p className="text-gray-500 mb-4">This feature is under development</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HostDashboard; 