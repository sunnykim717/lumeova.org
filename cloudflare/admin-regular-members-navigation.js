// The existing administrator UI replaces its member list after hydration.
const regularAdminNavAsset = "/_lumeova-admin/regular-members-nav.js";

function mountRegularMemberNavigation() {
  let queued = false;
  function syncRegularMemberLink() {
    queued = false;
    if (location.pathname.replace(/\/$/, "") !== "/admin/members") return;
    const heading = Array.from(document.querySelectorAll("main h1")).reverse().find(
      element => element.textContent.trim() === "회원" && !!element.getClientRects().length,
    );
    if (!heading || heading.parentElement.querySelector("[data-regular-member-link]")) return;
    const item = document.createElement("p");
    item.setAttribute("data-regular-member-link", "");
    item.className = "mt-2 mb-4";
    const link = document.createElement("a");
    link.href = "/admin/regular-members";
    link.textContent = "정회원 관리";
    link.className = "inline-flex items-center rounded-sm bg-navy px-4 py-3 text-sm font-medium text-cream";
    item.append(link);
    heading.after(item);
  }
  new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(syncRegularMemberLink);
  }).observe(document.documentElement, { childList: true, subtree: true });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", syncRegularMemberLink, { once: true });
  else syncRegularMemberLink();
}

function withRegularAdminNavigation(previousFetch) {
  return async function fetch(request, env, ctx) {
    const path = new URL(request.url).pathname.replace(/\/$/, "");
    if (path === regularAdminNavAsset && request.method === "GET") {
      return new Response("(" + mountRegularMemberNavigation.toString() + ")();", {
        headers: {
          "Cache-Control": "public, max-age=3600",
          "Content-Type": "application/javascript; charset=utf-8",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }
    const response = await previousFetch(request, env, ctx);
    if (!path.startsWith("/admin/") || path === "/admin/regular-members" ||
        request.method !== "GET" || response.status !== 200 ||
        !response.headers.get("Content-Type")?.includes("text/html")) return response;
    return new HTMLRewriter().on("head", {
      element(head) {
        head.append('<script defer src="' + regularAdminNavAsset + '"></script>', { html: true });
      },
    }).transform(response);
  };
}
