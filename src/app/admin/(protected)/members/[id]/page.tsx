"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/types/database";

type Supporter = Database["public"]["Tables"]["supporters"]["Row"];
type Membership = Database["public"]["Tables"]["memberships"]["Row"];
type PrivacyConsent = Database["public"]["Tables"]["privacy_consents"]["Row"];
type AdminNote = Database["public"]["Tables"]["admin_notes"]["Row"];
type Donation = Database["public"]["Tables"]["donations"]["Row"];

interface MemberDetail {
  supporter: Supporter | null;
  membership: Membership | null;
  privacyConsent: PrivacyConsent | null;
  adminNotes: AdminNote[];
  donations: Donation[];
}

export default function MemberDetailPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<MemberDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function fetchMemberData() {
      try {
        // Fetch supporter
        const { data: supporterData, error: supporterError } = await supabase
          .from("supporters")
          .select("*")
          .eq("id", params.id)
          .single();

        if (supporterError) throw supporterError;
        if (!supporterData) {
          setError("회원 정보를 찾을 수 없습니다.");
          return;
        }

        // Fetch membership
        const { data: membershipData } = await supabase
          .from("memberships")
          .select("*")
          .eq("supporter_id", params.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        // Fetch privacy consent
        const { data: privacyData } = await supabase
          .from("privacy_consents")
          .select("*")
          .eq("supporter_id", params.id)
          .order("agreed_at", { ascending: false })
          .limit(1)
          .single();

        // Fetch admin notes
        const { data: notesData } = await supabase
          .from("admin_notes")
          .select("*")
          .eq("supporter_id", params.id)
          .order("created_at", { ascending: false });

        // Fetch donations
        const { data: donationsData } = await supabase
          .from("donations")
          .select("*")
          .eq("supporter_id", params.id)
          .order("created_at", { ascending: false });

        setData({
          supporter: supporterData,
          membership: membershipData || null,
          privacyConsent: privacyData || null,
          adminNotes: notesData || [],
          donations: donationsData || [],
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    }

    fetchMemberData();
  }, [params.id, supabase]);

  if (loading) {
    return <div className="section-wrap py-10">로딩 중...</div>;
  }

  if (error || !data?.supporter) {
    return <div className="section-wrap py-10 text-red-500">{error || "회원 정보를 불러올 수 없습니다."}</div>;
  }

  const { supporter, membership, privacyConsent, adminNotes, donations } = data;

  return (
    <div className="section-wrap py-10">
      <div className="mb-8">
        <h1 className="text-[28px] font-display text-navy mb-2">회원 상세 정보</h1>
        <p className="text-[14px] text-muted">ID: {params.id}</p>
      </div>

      {/* Basic Info */}
      <section className="bg-white border border-border rounded-sm p-6 mb-8">
        <h2 className="font-display text-[18px] text-navy mb-4">기본 정보</h2>
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-[14px]">
          <dt className="text-muted font-medium">이름</dt>
          <dd className="text-ink">{supporter.name}</dd>

          {supporter.email && (
            <>
              <dt className="text-muted font-medium">이메일</dt>
              <dd className="text-ink break-all">{supporter.email}</dd>
            </>
          )}

          {supporter.phone && (
            <>
              <dt className="text-muted font-medium">전화번호</dt>
              <dd className="text-ink">{supporter.phone}</dd>
            </>
          )}

          {supporter.address && (
            <>
              <dt className="text-muted font-medium">주소</dt>
              <dd className="text-ink">{supporter.address}</dd>
            </>
          )}

          {supporter.birth_date && (
            <>
              <dt className="text-muted font-medium">생년월일</dt>
              <dd className="text-ink">{supporter.birth_date}</dd>
            </>
          )}

          <dt className="text-muted font-medium">등록일</dt>
          <dd className="text-ink">
            {new Date(supporter.created_at).toLocaleDateString("ko-KR")}
          </dd>
        </dl>
      </section>

      {/* Membership Info */}
      {membership && (
        <section className="bg-white border border-border rounded-sm p-6 mb-8">
          <h2 className="font-display text-[18px] text-navy mb-4">회원 정보</h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-[14px]">
            <dt className="text-muted font-medium">회원유형</dt>
            <dd className="text-ink">
              {membership.membership_type === "regular"
                ? "정회원"
                : "일반회원"}
            </dd>

            <dt className="text-muted font-medium">회원상태</dt>
            <dd className="text-ink">
              <span
                className={`px-2 py-1 rounded text-[12px] font-medium ${
                  membership.status === "approved"
                    ? "bg-green-100 text-green-700"
                    : membership.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                }`}
              >
                {membership.status === "approved"
                  ? "승인됨"
                  : membership.status === "pending"
                    ? "대기중"
                    : membership.status === "rejected"
                      ? "거부됨"
                      : membership.status === "inactive"
                        ? "비활성"
                        : "탈퇴"}
              </span>
            </dd>

            <dt className="text-muted font-medium">신청일</dt>
            <dd className="text-ink">
              {new Date(membership.created_at).toLocaleDateString("ko-KR")}
            </dd>

            {membership.approved_at && (
              <>
                <dt className="text-muted font-medium">승인일</dt>
                <dd className="text-ink">
                  {new Date(membership.approved_at).toLocaleDateString("ko-KR")}
                </dd>
              </>
            )}
          </dl>
        </section>
      )}

      {/* Privacy Consent */}
      {privacyConsent && (
        <section className="bg-white border border-border rounded-sm p-6 mb-8">
          <h2 className="font-display text-[18px] text-navy mb-4">개인정보 동의</h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-[14px]">
            <dt className="text-muted font-medium">동의 버전</dt>
            <dd className="text-ink">{privacyConsent.privacy_policy_version}</dd>

            <dt className="text-muted font-medium">동의 일시</dt>
            <dd className="text-ink">
              {new Date(privacyConsent.agreed_at).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </dd>

            <dt className="text-muted font-medium">마케팅 수신</dt>
            <dd className="text-ink">
              {privacyConsent.marketing_opt_in ? "동의" : "미동의"}
            </dd>
          </dl>
        </section>
      )}

      {/* Donations */}
      {donations.length > 0 && (
        <section className="bg-white border border-border rounded-sm p-6 mb-8">
          <h2 className="font-display text-[18px] text-navy mb-4">
            후원 내역 ({donations.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="bg-cream border-b border-border">
                <tr>
                  <th className="text-left p-3 text-muted font-medium">후원유형</th>
                  <th className="text-right p-3 text-muted font-medium">금액</th>
                  <th className="text-left p-3 text-muted font-medium">상태</th>
                  <th className="text-left p-3 text-muted font-medium">신청일</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((donation) => (
                  <tr key={donation.id} className="border-b border-border hover:bg-cream/50">
                    <td className="p-3 text-ink">
                      {donation.donation_type === "recurring"
                        ? "정기후원"
                        : donation.donation_type === "short_term"
                          ? "단기후원"
                          : "일시후원"}
                    </td>
                    <td className="text-right p-3 text-ink font-medium">
                      {donation.amount?.toLocaleString()}원
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-[11px] font-medium ${
                          donation.status === "active"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {donation.status === "active" ? "진행중" : "완료"}
                      </span>
                    </td>
                    <td className="p-3 text-muted">
                      {new Date(donation.created_at).toLocaleDateString("ko-KR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Admin Notes */}
      {adminNotes.length > 0 && (
        <section className="bg-white border border-border rounded-sm p-6 mb-8">
          <h2 className="font-display text-[18px] text-navy mb-4">
            관리자 메모 ({adminNotes.length})
          </h2>
          <div className="space-y-4">
            {adminNotes.map((note) => (
              <div key={note.id} className="border-l-2 border-gold pl-4 py-2">
                <p className="text-[14px] text-ink">{note.note}</p>
                <p className="text-[12px] text-muted mt-2">
                  {new Date(note.created_at).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="text-center">
        <Link
          href="/admin/members"
          className="inline-block px-6 py-2 text-[14px] text-navy hover:text-gold transition-colors"
        >
          목록으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
