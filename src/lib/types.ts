export interface Chapter {
    id: number;
    book_id: number;
    title: string;
    file_name: string;
    order_index: number;
    created_at: string;
}

export interface Book {
    id: number;
    uid: string;
    title: string;
    subtitle?: string;
    slug: string;
    author: string;
    publisher?: string;
    description: string;
    board?: string;
    grade?: string;
    subject?: string;
    language: string;
    tags?: string;
    file_name?: string;
    cover_image?: string;
    status: "pending" | "approved" | "rejected";
    downloads: number;
    views: number;
    rating: number;
    rating_count: number;
    created_at: string;
    approved_at?: string;
    updated_at?: string;
    chapters?: Chapter[];
}

export interface User {
    id: number;
    username: string;
    role: string;
}

export interface ApiKey {
    id: number;
    key: string;
    name: string;
    created_at: string;
}

export interface ActivityLog {
    id: number;
    action: string;
    entity_type: string;
    entity_id: number;
    details: string;
    user_id: number;
    created_at: string;
}

export interface DashboardStats {
    totalBooks: number;
    approvedBooks: number;
    pendingBooks: number;
    totalDownloads: number;
    totalViews: number;
    totalApiKeys: number;
    recentActivity: ActivityLog[];
}
