/**
 * Hand-written types mirroring supabase/migrations/0001_init.sql.
 *
 * Once the migration has actually been run against the real project, prefer
 * regenerating this file from the live schema instead of hand-editing it:
 *
 *   npx supabase gen types typescript --project-id <project-ref> > src/lib/types/database.ts
 *
 * Until then, this hand-written version is what the app is built against.
 */

export type MembershipType = "regular" | "general";
export type MembershipStatus = "pending" | "approved" | "rejected" | "inactive" | "withdrawn";
export type DonationType = "recurring" | "short_term" | "one_time";
export type DonationStatus = "active" | "completed" | "cancelled";
export type PaymentStatus = "pending" | "confirmed" | "unpaid" | "cancelled";
export type ContentStatus = "draft" | "published" | "hidden";
export type AdminRole = "super_admin" | "manager" | "staff" | "viewer";

export interface Database {
  public: {
    Tables: {
      admin_users: {
        Row: {
          id: string;
          role: AdminRole;
          display_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["admin_users"]["Row"]> & { id: string };
        Update: Partial<Database["public"]["Tables"]["admin_users"]["Row"]>;
        Relationships: [];
      };
      supporters: {
        Row: {
          id: string;
          name: string;
          phone: string | null;
          email: string | null;
          address: string | null;
          birth_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["supporters"]["Row"]> & { name: string };
        Update: Partial<Database["public"]["Tables"]["supporters"]["Row"]>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          supporter_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & { id: string };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      memberships: {
        Row: {
          id: string;
          supporter_id: string;
          membership_type: MembershipType;
          status: MembershipStatus;
          approved_at: string | null;
          approved_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["memberships"]["Row"]> & {
          supporter_id: string;
          membership_type: MembershipType;
        };
        Update: Partial<Database["public"]["Tables"]["memberships"]["Row"]>;
        Relationships: [];
      };
      donations: {
        Row: {
          id: string;
          supporter_id: string;
          donation_type: DonationType;
          amount: number;
          start_date: string | null;
          end_date: string | null;
          status: DonationStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["donations"]["Row"]> & {
          supporter_id: string;
          donation_type: DonationType;
          amount: number;
        };
        Update: Partial<Database["public"]["Tables"]["donations"]["Row"]>;
        Relationships: [];
      };
      donation_payments: {
        Row: {
          id: string;
          donation_id: string;
          amount: number;
          payment_date: string | null;
          status: PaymentStatus;
          confirmed_by: string | null;
          confirmed_at: string | null;
          admin_note: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["donation_payments"]["Row"]> & {
          donation_id: string;
          amount: number;
        };
        Update: Partial<Database["public"]["Tables"]["donation_payments"]["Row"]>;
        Relationships: [];
      };
      privacy_consents: {
        Row: {
          id: string;
          supporter_id: string | null;
          privacy_policy_version: string;
          marketing_opt_in: boolean;
          agreed_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["privacy_consents"]["Row"]> & {
          privacy_policy_version: string;
        };
        Update: Partial<Database["public"]["Tables"]["privacy_consents"]["Row"]>;
        Relationships: [];
      };
      admin_notes: {
        Row: {
          id: string;
          supporter_id: string;
          note: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["admin_notes"]["Row"]> & {
          supporter_id: string;
          note: string;
        };
        Update: Partial<Database["public"]["Tables"]["admin_notes"]["Row"]>;
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          admin_id: string | null;
          action: string;
          target_type: string;
          target_id: string | null;
          metadata: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["audit_logs"]["Row"]> & {
          action: string;
          target_type: string;
        };
        Update: Partial<Database["public"]["Tables"]["audit_logs"]["Row"]>;
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          title: string;
          slug: string;
          summary: string | null;
          content: string | null;
          location: string | null;
          start_date: string | null;
          end_date: string | null;
          status: ContentStatus;
          thumbnail: string | null;
          images: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["projects"]["Row"]> & {
          title: string;
          slug: string;
        };
        Update: Partial<Database["public"]["Tables"]["projects"]["Row"]>;
        Relationships: [];
      };
      news: {
        Row: {
          id: string;
          title: string;
          slug: string;
          category: string | null;
          summary: string | null;
          content: string | null;
          thumbnail: string | null;
          published_at: string | null;
          status: ContentStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["news"]["Row"]> & {
          title: string;
          slug: string;
        };
        Update: Partial<Database["public"]["Tables"]["news"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      current_admin_role: {
        Args: Record<string, never>;
        Returns: AdminRole | null;
      };
    };
  };
}

export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type NewsItem = Database["public"]["Tables"]["news"]["Row"];
export type Supporter = Database["public"]["Tables"]["supporters"]["Row"];
export type Membership = Database["public"]["Tables"]["memberships"]["Row"];
export type Donation = Database["public"]["Tables"]["donations"]["Row"];
export type DonationPayment = Database["public"]["Tables"]["donation_payments"]["Row"];
