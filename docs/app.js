(function () {
  "use strict";

  const sections = [
    { label: "사업 개요", items: [
      ["integrated_research_paper.html", "통합 사업보고서"]
    ]},
    { label: "대회 기준", items: [
      ["competition_purpose_and_project_direction.html", "대회 목적과 연구설계"],
      ["mandatory_project_requirements.html", "과제 필수 요건"]
    ]},
    { label: "근거 자료", items: [
      ["quantitative_evidence_and_articles.html", "시장·정량근거"],
      ["related_papers_review.html", "선행연구 검토"],
      ["source_registry.html", "전체 출처대장"]
    ]}
  ];

  const current = location.pathname.split("/").pop() || "index.html";
  const currentItem = sections.flatMap((section) => section.items).find(([href]) => href === current);
  const escapeHtml = (value) => value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);

  const groups = sections.map((section) => {
    const active = section.items.some(([href]) => href === current);
    const links = section.items.map(([href, label]) =>
      `<a href="${href}"${href === current ? ' class="active" aria-current="page"' : ""}>${label}</a>`
    ).join("");
    return `<div class="app-nav-group${active ? " section-active" : ""}">
      <button type="button" aria-expanded="false">${section.label}<span aria-hidden="true">⌄</span></button>
      <div class="app-nav-menu">${links}</div>
    </div>`;
  }).join("");

  const shell = document.createElement("header");
  shell.className = "app-header";
  shell.innerHTML = `<div class="app-header-inner">
    <a class="app-brand" href="integrated_research_paper.html" aria-label="통합 연구보고서 홈">
      <span>개항장 로컬기프트 연구</span><small>INCHEON B2B LOCAL GIFT</small>
    </a>
    <button class="app-menu-toggle" type="button" aria-expanded="false" aria-controls="app-navigation">
      <span>메뉴</span><i aria-hidden="true"></i>
    </button>
    <nav class="app-nav" id="app-navigation" aria-label="주요 문서">${groups}</nav>
  </div>
  <div class="app-location"><span>현재 문서</span>${escapeHtml(currentItem ? currentItem[1] : document.title)}</div>`;

  const oldHeader = document.querySelector("body > .top");
  if (oldHeader) oldHeader.replaceWith(shell);
  else document.body.prepend(shell);

  const toggle = shell.querySelector(".app-menu-toggle");
  const nav = shell.querySelector(".app-nav");
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
  });

  shell.querySelectorAll(".app-nav-group > button").forEach((button) => {
    button.addEventListener("click", () => {
      const group = button.parentElement;
      const open = button.getAttribute("aria-expanded") !== "true";
      shell.querySelectorAll(".app-nav-group").forEach((other) => {
        if (other !== group) {
          other.classList.remove("is-open");
          other.querySelector("button").setAttribute("aria-expanded", "false");
        }
      });
      button.setAttribute("aria-expanded", String(open));
      group.classList.toggle("is-open", open);
    });
  });

  document.addEventListener("click", (event) => {
    if (!shell.contains(event.target)) {
      shell.querySelectorAll(".app-nav-group.is-open").forEach((group) => {
        group.classList.remove("is-open");
        group.querySelector("button").setAttribute("aria-expanded", "false");
      });
    }
  });

  const referenceIds = new Set(
    [...document.querySelectorAll('[id^="r"]')]
      .map((element) => element.id)
      .filter((id) => /^r\d+$/.test(id))
  );
  if (referenceIds.size) {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const citationNodes = [];
    while (walker.nextNode()) {
      const parent = walker.currentNode.parentElement;
      if (parent && !parent.closest("a, script, style, code, pre") && /\[\d+\]/.test(walker.currentNode.nodeValue)) {
        citationNodes.push(walker.currentNode);
      }
    }
    citationNodes.forEach((node) => {
      const parts = node.nodeValue.split(/(\[\d+\])/g);
      const fragment = document.createDocumentFragment();
      parts.forEach((part) => {
        const match = part.match(/^\[(\d+)\]$/);
        if (!match || !referenceIds.has(`r${match[1]}`)) {
          fragment.append(part);
          return;
        }
        const reference = document.getElementById(`r${match[1]}`);
        const link = document.createElement("a");
        link.href = `#r${match[1]}`;
        link.className = "citation-link";
        link.textContent = part;
        link.title = reference.textContent.trim().replace(/\s+/g, " ").slice(0, 140);
        link.setAttribute("aria-label", `참고문헌 ${match[1]}로 이동`);
        fragment.append(link);
      });
      node.replaceWith(fragment);
    });
  }

})();
