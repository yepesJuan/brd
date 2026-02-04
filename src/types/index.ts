// User roles - matches database enum
export type Role = 'BUSINESS' | 'PRODUCT' | 'TECH';

// Requirement status - matches database enum
export type Status = 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED';

// User from public.users table
export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar_url: string | null;
  created_at: string;
}

// Requirement from public.requirements table
export interface Requirement {
  id: string;
  title: string;
  description: string | null;
  file_path: string;
  file_name: string;
  epic_link: string | null;
  status: Status;
  uploaded_by: string;
  updated_by: string | null;
  status_changed_at: string | null;
  created_at: string;
  updated_at: string;
}

// Sign-off from public.sign_offs table
export interface SignOff {
  id: string;
  requirement_id: string;
  user_id: string;
  role: Role;
  comment: string | null;
  signed_at: string;
}

// Extended types with relations
export interface RequirementWithRelations extends Requirement {
  uploaded_by_user: Pick<User, 'id' | 'name' | 'avatar_url' | 'role'>;
  sign_offs: Array<SignOffWithUser>;
}

export interface SignOffWithUser extends SignOff {
  user: Pick<User, 'id' | 'name' | 'avatar_url'>;
}

// Grouped sign-offs by role
export interface SignOffsByRole {
  TECH: SignOffWithUser[];
  PRODUCT: SignOffWithUser[];
  BUSINESS: SignOffWithUser[];
}

// Role display configuration
export const ROLE_CONFIG: Record<Role, { label: string; description: string; color: string }> = {
  BUSINESS: {
    label: 'Business Stakeholder',
    description: 'I create and upload requirements',
    color: 'green',
  },
  PRODUCT: {
    label: 'Product Owner',
    description: 'I review requirements for product alignment',
    color: 'purple',
  },
  TECH: {
    label: 'Tech Lead',
    description: 'I review technical feasibility',
    color: 'blue',
  },
};

// Status display configuration
export const STATUS_CONFIG: Record<Status, { label: string; color: string }> = {
  DRAFT: { label: 'Draft', color: 'gray' },
  IN_REVIEW: { label: 'In Review', color: 'yellow' },
  APPROVED: { label: 'Approved', color: 'green' },
  REJECTED: { label: 'Rejected', color: 'red' },
};
