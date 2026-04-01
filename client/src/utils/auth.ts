interface User {
  email: string;
  password: string;
  profile: {
    [key: string]: any;
  };
  // New fields - all optional to avoid breaking existing users
  name?: string;
  age?: number;
  city?: string;
  experienceLevel?: string;
  fitnessGoal?: string;
  height?: string;
  weight?: string;
  bodyType?: string;
  limitations?: string;
  isOwner?: boolean;
  isVIP?: boolean;
}

const USERS_STORAGE_KEY = "untamedUsers";
const ACTIVE_USER_KEY = "untamedActiveUser";

export function createUser(email: string, password: string): User {
  const users: User[] = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || "[]");
  
  if (users.some(u => u.email === email)) {
    throw new Error("Email already in use");
  }
  
  // Auto-set owner and VIP status for specific email
  const isOwnerEmail = email === "untamedfitapp@gmail.com";
  const newUser: User = { 
    email, 
    password, 
    profile: {},
    isOwner: isOwnerEmail,
    isVIP: isOwnerEmail // Owner is automatically VIP
  };
  users.push(newUser);
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  
  return newUser;
}

export function loginUser(email: string, password: string): User | null {
  const users: User[] = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || "[]");
  return users.find(u => u.email === email && u.password === password) || null;
}

export function setActiveUser(email: string): void {
  localStorage.setItem(ACTIVE_USER_KEY, email);
}

export function getActiveUser(): string | null {
  return localStorage.getItem(ACTIVE_USER_KEY);
}

export function getCurrentUserProfile(): User | null {
  const email = getActiveUser();
  if (!email) return null;
  
  const users: User[] = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || "[]");
  return users.find(u => u.email === email) || null;
}

export function logoutUser(): void {
  localStorage.removeItem(ACTIVE_USER_KEY);
}

export function isOwner(): boolean {
  const currentUser = getCurrentUserProfile();
  return currentUser?.email === "untamedfitapp@gmail.com" || currentUser?.isOwner === true;
}

export function isAuthenticated(): boolean {
  return !!getActiveUser();
}

export function updateUserProfile(updates: Record<string, any>): void {
  const email = getActiveUser();
  if (!email) throw new Error("No active user");
  
  const users: User[] = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || "[]");
  const userIndex = users.findIndex(u => u.email === email);
  
  if (userIndex === -1) throw new Error("User not found");
  
  users[userIndex].profile = { ...users[userIndex].profile, ...updates };
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}
