
// Update FeaturedItem interface to allow string IDs
export interface FeaturedItem {
  id: string | number;
  title: string;
  description: string;
  image: string;
  price_per_person?: number;
  price_per_night?: number;
  host: {
    name: string;
    rating: number;
    reviews: number;
  };
}

export interface CategoryCount {
  cuisine_type: string;
  count: number;
}
