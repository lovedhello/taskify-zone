
// Update the review types to include "food_experience" as valid type
export type ReviewTargetType = "stay" | "food" | "food_experience";

export interface Review {
  id: string;
  author_id: string;
  target_id: string;
  target_type: ReviewTargetType;
  rating: number;
  comment: string;
  created_at: string;
  updated_at?: string;
  author?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}
