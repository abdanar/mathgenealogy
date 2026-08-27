export type Mathematician = {
  id: string;
  name: string;
  birthYear?: number;
  deathYear?: number;
  degreeYear?: number;
  university?: string;
  dissertation?: string;
  fields?: string[];
};

export type AcademicRelationship = {
  advisorId: string;
  studentId: string;
};

export type LocalGenealogy = {
  advisors: Mathematician[];
  subject: Mathematician;
  students: Mathematician[];
  relationships: AcademicRelationship[];
};