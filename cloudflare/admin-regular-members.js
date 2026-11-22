// Added to the existing production Worker entry before its default export.
// The existing Worker, assets, and bindings continue to serve every other route.
const regularAdminPath = "/admin/regular-members";
const regularAdminErrors = {
  administrator_required: "회원 정보를 변경할 권한이 없습니다.",
  invalid_member_details: "이름, 연락처, 생년월일을 확인해 주세요.",
  membership_already_exists: "이미 회원 이력이 있습니다. 기존 회원을 확인해 주세요.",
  membership_not_general: "전환할 일반회원을 찾을 수 없습니다. 목록을 새로고침해 주세요.",
  supporter_contact_conflict: "기존 연락처와 일치하는 기록이 있습니다. 이름과 연락처를 확인해 주세요.",
  failed: "처리하지 못했습니다. 다시 시도해 주세요.",
  confirmation: "정회원 전환 확인란을 선택해 주세요.",
};
const regularAdminStatuses = {
  pending: "승인대기", approved: "승인됨", rejected: "거절됨", inactive: "비활성", withdrawn: "탈퇴",
};

function regularAdminEscape(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]
  ));
}

function regularAdminContact(member) {
  const digits = (member.phone ?? "").replace(/\D/g, "");
  if (digits.length >= 4) return "전화 끝자리 " + digits.slice(-4);
  if (member.email) return member.email.slice(0, 1) + "***";
  return "연락처 없음";
}

function regularAdminPage({ members, history, canWrite, feedback, hasError, listError, historyError, canSeeHistory }) {
  const esc = regularAdminEscape;
  const registration = canWrite ? `
    <section><h2>정회원 직접 등록</h2>
    <p>이름과 전화번호 또는 이메일을 입력해 주세요. 등록 즉시 승인 상태로 저장됩니다.</p>
    <form action="${regularAdminPath}" method="post">
      <input type="hidden" name="action" value="register">
      <div class="fields">
        <label>이름<input name="name" autocomplete="name" maxlength="100" required></label>
        <label>전화번호<input name="phone" type="tel" autocomplete="tel" maxlength="15"></label>
        <label>이메일<input name="email" type="email" autocomplete="email" maxlength="254"></label>
        <label>생년월일 (선택)<input name="birthDate" type="date" autocomplete="bday"></label>
        <label class="full">주소 (선택)<input name="address" autocomplete="street-address" maxlength="300"></label>
      </div>
      <button>정회원으로 등록</button>
    </form></section>` : "";
  const memberRows = members.map(member => {
    const isGeneral = member.membership_type === "general";
    const form = canWrite && isGeneral ? `
      <details><summary>정회원 전환</summary><form action="${regularAdminPath}" method="post">
        <input type="hidden" name="action" value="promote">
        <input type="hidden" name="membershipId" value="${esc(member.id)}">
        <label class="check"><input type="checkbox" name="confirmed" value="yes" required>
        ${esc(member.name)} 님을 정회원으로 전환합니다.</label>
        <button>전환 확인</button>
      </form></details>` : "";
    return `<li><div><strong>${esc(member.name)}</strong>
      <span>${isGeneral ? "일반회원" : "정회원"} · ${esc(regularAdminStatuses[member.status])}</span>
      <small>${esc(regularAdminContact(member))}</small></div>${form}</li>`;
  }).join("");
  const date = new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Seoul" });
  const historyRows = history
    .filter(row => ["membership_regular_registered", "membership_promoted_to_regular"].includes(row.action))
    .map(row => `<li><div><strong>${row.action === "membership_regular_registered" ? "정회원 직접 등록" : "정회원 전환"}</strong>
      <span>${date.format(new Date(row.created_at))} · ${esc(row.actor || "관리자")}</span>
      <small>이전 유형 ${row.previous_membership_type === "general" ? "일반회원" : "—"}</small></div></li>`).join("");
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>정회원 관리 | 미래를여는빛</title>
    <style>
      *{box-sizing:border-box}body{margin:0;background:#f7f5ef;color:#182d40;font:16px/1.55 system-ui,sans-serif}
      main{max-width:56rem;margin:auto;padding:1.25rem}a{color:#214e6e}nav{display:flex;gap:1rem;flex-wrap:wrap}
      h1{margin:1rem 0}h2{margin:0 0 .65rem;font-size:1.2rem}p{margin:.5rem 0 1rem}
      section{background:white;border:1px solid #d9dfdf;border-radius:.5rem;padding:1rem;margin:1rem 0}
      .fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.8rem}
      label{display:grid;gap:.3rem}.full{grid-column:1/-1}.check{display:flex;align-items:flex-start;gap:.5rem}
      input:not([type=checkbox]){width:100%;min-width:0;min-height:44px;border:1px solid #718797;border-radius:.25rem;padding:.5rem;font:inherit}
      button,summary{min-height:44px;cursor:pointer;font:inherit;padding:.45rem .75rem;border-radius:.25rem}
      button{margin-top:.65rem;background:#182d40;color:#fff;border:1px solid #182d40}
      summary{border:1px solid #718797;width:max-content;max-width:100%}details form{margin-top:.5rem}
      ul{list-style:none;margin:0;padding:0}li{padding:.8rem 0;border-top:1px solid #d9dfdf;display:flex;flex-wrap:wrap;gap:.6rem 1.5rem;justify-content:space-between}
      strong,span,small{display:block;overflow-wrap:anywhere}small{font-size:.85rem}.error{color:#902222}
      @media(max-width:35rem){.fields{grid-template-columns:1fr}main{padding:.85rem}li{display:block}details{margin-top:.5rem}}
    </style></head><body><main>
    <nav aria-label="관리자 메뉴"><a href="/admin/members">회원 목록</a><a href="/admin/dashboard">관리자 대시보드</a></nav>
    <h1>정회원 관리</h1>
    ${feedback ? `<p role="${hasError ? "alert" : "status"}" class="${hasError ? "error" : ""}">${esc(feedback)}</p>` : ""}
    ${registration}
    <section><h2>회원 목록</h2>${listError ? "<p>회원 목록을 불러오지 못했습니다.</p>" : memberRows ? "<ul>" + memberRows + "</ul>" : "<p>등록된 회원이 없습니다.</p>"}</section>
    ${canSeeHistory ? `<section><h2>정회원 변경 이력</h2>${historyError ? "<p>변경 이력을 불러오지 못했습니다.</p>" : historyRows ? "<ul>" + historyRows + "</ul>" : "<p>기록된 변경 이력이 없습니다.</p>"}</section>` : ""}
    </main></body></html>`;
}

async function handleRegularAdmin(request, createSessionClient, parseCookies, serializeCookie) {
  const url = new URL(request.url);
  const headers = new Headers({
    "Cache-Control": "private, no-store",
    "Content-Type": "text/html; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "same-origin",
    "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
    "X-Lumeova-Regular-Members": "1",
  });
  const reply = (body, status = 200) => new Response(body, { status, headers });
  const redirect = target => {
    headers.set("Location", target);
    return reply(null, 303);
  };
  if (!["GET", "POST", "HEAD"].includes(request.method)) return reply("Method not allowed", 405);
  if (request.method === "POST" && request.headers.get("Origin") !== url.origin) return reply("Forbidden", 403);
  const supabase = createSessionClient({
    getAll: () => parseCookies(request.headers.get("Cookie") ?? "").map(({ name, value }) => ({ name, value: value ?? "" })),
    setAll: values => values.forEach(({ name, value, options }) => headers.append("Set-Cookie", serializeCookie(name, value, options))),
  });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/admin/login");
  const { data: admin } = await supabase.from("admin_users").select("role").eq("id", user.id).maybeSingle();
  if (!admin) return reply("관리자 권한이 필요합니다.", 403);
  const canWrite = ["super_admin", "manager", "staff"].includes(admin.role);
  const canSeeHistory = ["super_admin", "manager"].includes(admin.role);

  if (request.method === "POST") {
    if (!canWrite) return reply("회원 정보를 변경할 권한이 없습니다.", 403);
    const form = await request.formData().catch(() => null);
    const value = key => String(form?.get(key) ?? "").trim();
    let operation;
    let success;
    if (value("action") === "register") {
      const birthDate = value("birthDate");
      if (birthDate && !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) return redirect(regularAdminPath + "?result=invalid_member_details");
      operation = supabase.rpc("admin_register_regular_member", {
        p_name: value("name"), p_phone: value("phone"), p_email: value("email"),
        p_address: value("address"), p_birth_date: birthDate || null,
      });
      success = "registered";
    } else if (value("action") === "promote") {
      if (value("confirmed") !== "yes") return redirect(regularAdminPath + "?result=confirmation");
      if (!/^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i.test(value("membershipId"))) {
        return redirect(regularAdminPath + "?result=membership_not_general");
      }
      operation = supabase.rpc("admin_promote_general_member", { p_id: value("membershipId") });
      success = "promoted";
    } else {
      return reply("잘못된 요청입니다.", 400);
    }
    const { data, error } = await operation;
    const result = data && !error ? success : Object.hasOwn(regularAdminErrors, error?.message) ? error.message : "failed";
    return redirect(regularAdminPath + "?result=" + result);
  }

  const [members, history] = await Promise.all([
    supabase.rpc("admin_read_members", { p_status: null }),
    canSeeHistory ? supabase.rpc("admin_read_member_management_history") : { data: [] },
  ]);
  const state = url.searchParams.get("result");
  const hasError = Object.hasOwn(regularAdminErrors, state);
  return reply(request.method === "HEAD" ? null : regularAdminPage({
    members: members.data ?? [],
    history: history.data ?? [],
    canWrite, canSeeHistory, hasError,
    listError: Boolean(members.error),
    historyError: Boolean(history.error),
    feedback: state === "registered" ? "정회원으로 등록했습니다." : state === "promoted" ? "정회원으로 전환했습니다." : hasError ? regularAdminErrors[state] : "",
  }));
}

function withRegularAdmin(worker, createSessionClient, parseCookies, serializeCookie) {
  return {
    ...worker,
    async fetch(request, env, ctx) {
      const path = new URL(request.url).pathname.replace(/\/$/, "");
      if (path === regularAdminPath) return handleRegularAdmin(request, createSessionClient, parseCookies, serializeCookie);
      const response = await worker.fetch(request, env, ctx);
      if (path !== "/admin/members" || request.method !== "GET" || response.status !== 200 ||
          !response.headers.get("Content-Type")?.includes("text/html")) return response;
      let linked = false;
      return new HTMLRewriter().on("main h1", { element(heading) {
        if (linked) return;
        linked = true;
        heading.after('<p class="mb-4"><a class="inline-block rounded-sm bg-navy px-4 py-3 text-cream" href="/admin/regular-members">정회원 관리</a></p>', { html: true });
      }}).transform(response);
    },
  };
}
