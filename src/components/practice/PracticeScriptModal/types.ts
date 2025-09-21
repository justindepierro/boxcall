export interface PracticeScriptPlay {
  id: string;
  playId?: string; // Reference to playbook play if selected from playbook
  playName: string;
  personnel?: string;
  notes?: string;
  defenseFront?: string;
  defensiveCoverage?: string;
  blitz?: string;
  stunt?: string;
  hash?: string;
  situation?: string;
}

export interface PracticeScript {
  id: string;
  name: string;
  date?: string;
  opponent?: string;
  plays: PracticeScriptPlay[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PracticeScriptFormData {
  name: string;
  date?: string;
  opponent?: string;
}
