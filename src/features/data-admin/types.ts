// =============================================================================
// Paginated Response
// =============================================================================

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// =============================================================================
// Stats
// =============================================================================

export interface DataStats {
  overview: {
    countries: number;
    universities: number;
    courses: number;
    course_offerings: number;
    disciplines: number;
    careers: number;
    scholarships: number;
  };
  countries: {
    total: number;
    scholarship_only: number;
    with_universities: number;
    total_faqs: number;
    total_expenses: number;
  };
  universities: {
    total: number;
    by_category: Record<string, number>;
    by_scholarship: Record<string, number>;
    with_ranking: number;
    avg_courses_per_uni: number;
  };
  courses: {
    total: number;
    active: number;
    inactive: number;
    disciplines: number;
    without_discipline: number;
  };
  course_offerings: {
    total: number;
    active: number;
    inactive: number;
    with_requirements: number;
    without_requirements: number;
    with_expenses: number;
    avg_fee: number;
  };
  academics: {
    alevel_combinations: number;
    alevel_subjects: number;
    alevel_grades: number;
    olevel_subjects: number;
    olevel_grades: number;
  };
  careers: {
    total: number;
    with_specifics: number;
    scholarships: number;
  };
}

// =============================================================================
// Country
// =============================================================================

export interface DataCountry {
  id: string;
  name: string;
  slug: string;
  description: string;
  scholarship_only: boolean;
  is_active: boolean;
  universities_count?: number;
  expenses_count?: number;
  faqs_count?: number;
  created_at: string;
  updated_at: string;
}

export interface DataCountryExpense {
  id: string;
  country: string;
  country_name?: string;
  name: string;
  iname: string;
  currency: string;
  is_default: boolean;
  offer: number;
  tag: string | null;
  linked_stage: string | null;
  description: string | null;
  start_amount: number;
  end_amount: number;
  created_at: string;
  updated_at: string;
}

export interface DataCountryFAQ {
  id: string;
  country: string;
  country_name?: string;
  question: string;
  answer: string;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// University
// =============================================================================

export type UniversityCategory = 'PUBLIC' | 'PRIVATE';
export type ScholarshipType = 'FULL' | 'TUITION' | 'HALF' | 'NONE';

export interface UniversityLocation {
  id?: string;
  region?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface UniversityRanking {
  id?: string;
  global_rank?: number | null;
  country_rank?: number | null;
  continent_rank?: number | null;
}

export interface DataUniversity {
  id: string;
  name: string;
  slug: string;
  code?: string | null;
  order?: number;
  country: string;
  country_name?: string;
  category: UniversityCategory;
  institution_type: string;
  scholarship?: ScholarshipType;
  offer?: number;
  max_applications?: number;
  website_link?: string | null;
  admission_link?: string | null;
  video?: string | null;
  video_url?: string | null;
  img_url?: string | null;
  description?: string | null;
  capacity?: number | null;
  no_of_students?: number;
  location?: UniversityLocation | null;
  ranking?: UniversityRanking | null;
  courses_count?: number;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// Course & Discipline
// =============================================================================

export interface DataDiscipline {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string | null;
  courses_count?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DataCourse {
  id: string;
  name: string;
  slug: string;
  code?: string | null;
  version?: number;
  category?: string | null;
  combination?: string | null;
  short_description?: string | null;
  long_description?: string | null;
  is_active?: boolean;
  order?: number;
  video_url?: string | null;
  img_url?: string | null;
  description?: string | null;
  offerings_count?: number;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// Course Offering (course_university)
// =============================================================================

export interface DataCourseOffering {
  id: string;
  name: string;
  unclear_name?: string | null;
  course: string;
  course_name?: string;
  university: string;
  university_name?: string;
  country_name?: string;
  offer?: number;
  min_capacity?: number | null;
  max_capacity?: number | null;
  duration?: number | null;
  fee?: number;
  is_active?: boolean;
  requirements?: DataCourseRequirementsNested | null;
  course_expenses?: DataCourseOfferingExpenseNested[];
  // List-only fields (from CourseUniversityList)
  has_requirements?: boolean;
  expense_count?: number;
  created_at: string;
  updated_at?: string;
}

// =============================================================================
// Course Requirements
// =============================================================================

export interface DataCourseRequirementsNested {
  id?: string;
  combinations?: string | null;
  detailed_requirement?: string | null;
  admission_points?: number | null;
  requirement?: string | null;
  requirement_json?: unknown;
  version?: number;
}

export interface DataCourseRequirements {
  id: string;
  combinations?: string | null;
  detailed_requirement?: string | null;
  admission_points?: number | null;
  requirement?: string | null;
  requirement_json?: unknown;
  version?: number;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// Course Offering Expense
// =============================================================================

export interface DataCourseOfferingExpenseNested {
  id?: string;
  currency?: string;
  iname: string;
  name: string;
  offer?: number;
  is_default?: boolean;
  tag?: string | null;
  linked_stage?: string | null;
  description?: string | null;
  start_amount: number;
  end_amount: number;
}

export interface DataCourseOfferingExpense {
  id: string;
  uni_course: string;
  currency?: string;
  iname: string;
  name: string;
  offer?: number;
  is_default?: boolean;
  tag?: string | null;
  linked_stage?: string | null;
  description?: string | null;
  start_amount: number;
  end_amount: number;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// Careers & Scholarships
// =============================================================================

export interface DataCareer {
  id: string;
  name: string;
  slug: string;
  description: string;
  salary_range_min: number | null;
  salary_range_max: number | null;
  salary_currency: string;
  growth_rate: string | null;
  is_active: boolean;
  courses_count?: number;
  created_at: string;
  updated_at: string;
}

export interface DataScholarship {
  id: string;
  name: string;
  slug: string;
  university: string | null;
  university_name?: string;
  country: string | null;
  country_name?: string;
  description: string;
  amount: number | null;
  currency: string;
  coverage: string;
  eligibility: string;
  deadline: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// A-Level / O-Level Academics
// =============================================================================

export interface DataALevelSubject {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
}

export interface DataALevelGrade {
  id: string;
  grade: string;
  points: number;
}

export interface DataALevelCombination {
  id: string;
  name: string;
  code: string;
  subjects: string[];
  subject_names?: string[];
  is_active: boolean;
}

export interface DataOLevelSubject {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
}

export interface DataOLevelGrade {
  id: string;
  grade: string;
  points: number;
}

// =============================================================================
// University Expenses / Pictures / Videos / Study Reasons
// =============================================================================

export interface DataUniversityExpense {
  id: string;
  university: string;
  university_name?: string;
  name: string;
  currency: string;
  start_amount: number;
  end_amount: number;
  tag: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface DataUniversityPicture {
  id: string;
  university: string;
  university_name?: string;
  name: string;
  image: string;
  created_at: string;
  updated_at: string;
}

export interface DataUniversityVideo {
  id: string;
  university: string;
  university_name?: string;
  name: string;
  video_url: string;
  created_at: string;
  updated_at: string;
}

export interface DataUniversityStudyReason {
  id: string;
  university: string;
  university_name?: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// Course Trends / Pictures / Videos
// =============================================================================

export interface DataCourseTrend {
  id: string;
  course: string;
  course_name?: string;
  // 14 scoring fields (0-10 scale each)
  sector_relevance: number | null;
  employment_demand: number | null;
  self_employment_potential: number | null;
  formal_employment_demand: number | null;
  geographical_relevance: number | null;
  economic_trends_alignment: number | null;
  technological_advancement_alignment: number | null;
  government_policy_support: number | null;
  skill_gap_industry_need: number | null;
  career_progression_stability: number | null;
  income_salary_potential: number | null;
  alignment_with_sdgs: number | null;
  educational_infrastructure_quality: number | null;
  cultural_acceptance: number | null;
  // Computed/summary fields
  predictability_duration: string | null;
  overall_potential: number | null;
  created_at: string;
  updated_at: string;
}

export interface DataCoursePicture {
  id: string;
  course: string;
  course_name?: string;
  name: string;
  image: string;
  created_at: string;
  updated_at: string;
}

export interface DataCourseVideo {
  id: string;
  course: string;
  course_name?: string;
  name: string;
  video_url: string;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// Course Syllabus: Course Years / Semesters / Course Semesters / Modules
// =============================================================================

export interface DataCourseYear {
  id: string;
  uni_course: string;
  uni_course_name?: string;
  year: number;
  objective: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface DataSemester {
  id: string;
  semister_no: number;
  name: string;
  start_month: string;
  end_month: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface DataCourseSemester {
  id: string;
  course_year: string;
  course_year_name?: string;
  semister: string;
  semister_name?: string;
  created_at: string;
  updated_at: string;
}

export interface DataCourseModule {
  id: string;
  course_semister: string;
  course_semister_name?: string;
  title: string;
  code: string;
  description: string;
  category: 'ELECTIVE' | 'NON ELECTIVE';
  version: string;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// Query Params
// =============================================================================

export interface ListParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  [key: string]: string | number | boolean | undefined;
}
