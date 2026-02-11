export type ProfileStats = {
  sessionsCompleted: number;
  averageRating: number | null;
  ratingCount: number;
};

export type Skill = {
  id: string;
  name: string;
};

export type Feedback = {
  id: string;
  rating: number;
  comment: string;
  fromUser: {
    id: string;
    name: string;
  };
};

export type Profile = {
  id: string;
  name: string;
  bio?: string;
  createdAt: string;

  stats: ProfileStats;
  skillsOffered: Skill[];
  skillsWanted: Skill[];
  feedbacks: Feedback[];
};
