export interface QuizQuestion {
  id: number;
  question: string;
  subtitle?: string;
  options: string[];
  cuteReaction: string[];
}

export interface PhotoMemory {
  id: string;
  url: string;
  caption: string;
}

export interface CreatorSettings {
  girlfriendName: string;
  boyfriendName: string;
  recipientEmail: string;
  customProposalTitle: string;
  customProposalSubtitle: string;
  soundEnabled: boolean;
  photos: PhotoMemory[];
}

export interface ProposalAnswer {
  question: string;
  answer: string;
}

export interface ServerResponseRecord {
  id: string;
  answer: string;
  customNote?: string;
  girlfriendName: string;
  boyfriendName: string;
  recipientEmail: string;
  answersList: ProposalAnswer[];
  timestamp: string;
  emailSentStatus: string;
}
