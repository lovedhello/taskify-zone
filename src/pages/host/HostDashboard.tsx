
// Fix the status type issue by casting the data to the correct type
const fetchFoodExperiences = async () => {
  try {
    setLoading(true);
    setError(null);
    const data = await getHostFoodExperiences();
    
    // Cast string status to the proper enum type
    const typedData = data.map(exp => ({
      ...exp,
      status: exp.status as 'draft' | 'published' | 'archived'
    }));
    
    setFoodExperiences(typedData);
  } catch (err) {
    console.error('Error fetching food experiences:', err);
    setError('Failed to load your food experiences. Please try again later.');
  } finally {
    setLoading(false);
  }
};

const fetchStays = async () => {
  try {
    setLoading(true);
    setError(null);
    const data = await getHostStays();
    
    // Cast string status to the proper enum type
    const typedData = data.map(stay => ({
      ...stay,
      status: stay.status as 'draft' | 'published' | 'archived'
    }));
    
    setStays(typedData);
  } catch (err) {
    console.error('Error fetching stays:', err);
    setError('Failed to load your stays. Please try again later.');
  } finally {
    setLoading(false);
  }
};
