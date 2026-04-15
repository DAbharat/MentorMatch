export type ProfileStats = {
  sessionsCompletedAsMentor: number;
  sessionsCompletedAsMentee: number;
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
  mentee: {
    id: string;
    name: string;
  };
  skill: {
    id: string;
    name: string;
  };
  createdAt: Date | string;
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
