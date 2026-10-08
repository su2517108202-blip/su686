(function () {
  "use strict";

  const MODULE_FILES = Object.freeze({ A: "A.html", B: "B.html", D: "D.html" });
  function referenceState(segment) {
    const required = segment && Array.isArray(segment.boardReferences) ? segment.boardReferences : [];
    const complete = required.length > 0 && required.every(function (item) {
      return item && item.generated === true && item.bound === true;
    });
    const missing = required.filter(function (item) {
      return !item || item.generated !== true || item.bound !== true;
    }).map(function (item, index) {
      const name = item && typeof item.name === "string" && item.name.trim()
        ? item.name : "预定九宫格" + (index + 1);
      return name + ((!item || item.generated !== true) ? "未生成" : "上传绑定待核");
    });
    return {
      ready: complete,
      label: complete ? "预定九宫格按当前记录已生成并绑定" : "完整分镜已备 · 预定九宫格尚未就绪",
      detail: complete
        ? "直接使用同一份既有分镜提示词，按实际平台输入生成视频。"
        : (missing.length ? missing.join("；") + "。" : "尚未记录预定九格状态。") +
          "按正文固定名生成九格并实际挂载后，用同一份既有分镜提示词生成视频；无需回填，状态不限制复制。"
    };
  }

  function trustedModule(event, frame) {
    if (!frame || !event || event.source !== frame.contentWindow) return null;
    const data = event.data;
    if (!data || typeof data !== "object" || data.type !== "su686:module" ||
        typeof data.module !== "string" ||
        !Object.prototype.hasOwnProperty.call(MODULE_FILES, data.module)) return null;
    return data.module;
  }

  async function copyText(value) {
    if (typeof value !== "string") return { ok: false, method: null };
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        await navigator.clipboard.writeText(value);
        return { ok: true, method: "clipboard" };
      }
    } catch (_) {
      // Continue to the internal fallback; success is reported only if it succeeds.
    }
    let temporary;
    const previousFocus = document.activeElement;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    try {
      temporary = document.createElement("textarea");
      temporary.value = value;
      temporary.readOnly = true;
      temporary.setAttribute("aria-hidden", "true");
      temporary.style.position = "fixed";
      temporary.style.left = "-10000px";
      temporary.style.top = "0";
      document.body.appendChild(temporary);
      temporary.focus();
      temporary.select();
      temporary.setSelectionRange(0, value.length);
      const copied = typeof document.execCommand === "function" && document.execCommand("copy") === true;
      return { ok: copied, method: copied ? "execCommand" : null };
    } catch (_) {
      return { ok: false, method: null };
    } finally {
      if (temporary && temporary.parentNode) temporary.parentNode.removeChild(temporary);
      if (previousFocus && typeof previousFocus.focus === "function") {
        try { previousFocus.focus({ preventScroll: true }); } catch (_) { /* No effect on copy result. */ }
      }
      if (typeof window.scrollTo === "function") {
        try { window.scrollTo(scrollX, scrollY); } catch (_) { /* No effect on copy result. */ }
      }
    }
  }

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function textAt(id, value) {
    const node = document.getElementById(id);
    if (node) node.textContent = value || "";
  }

  function promptDetails(label, text, id) {
    const details = element("details", "prompt-details");
    const summary = element("summary", "", label);
    const field = element("textarea", "prompt-text");
    field.readOnly = true;
    field.value = text;
    field.rows = 12;
    field.id = id;
    field.setAttribute("aria-label", label);
    details.append(summary, field);
    return details;
  }

  function feedbackNode() {
    const node = element("p", "copy-feedback");
    node.setAttribute("role", "status");
    node.setAttribute("aria-live", "polite");
    return node;
  }

  function copyButton(label, textProvider, feedback, successProvider) {
    const button = element("button", "copy-button", label);
    button.type = "button";
    button.addEventListener("click", async function () {
      button.disabled = true;
      feedback.textContent = "";
      delete feedback.dataset.state;
      try {
        const exactText = textProvider();
        const result = await copyText(exactText);
        feedback.dataset.state = result.ok ? "success" : "error";
        feedback.textContent = result.ok
          ? (successProvider ? successProvider() : "已复制完整提示词。")
          : "复制失败：未能写入剪贴板，请检查浏览器权限后重试。";
      } catch (error) {
        feedback.dataset.state = "error";
        feedback.textContent = "复制失败：" + error.message;
      } finally {
        button.disabled = false;
      }
    });
    return button;
  }

  function renderAssets(data) {
    textAt("common-art", data.commonArt);
    const list = document.getElementById("asset-list");
    if (!list || !Array.isArray(data.assets)) return;
    data.assets.forEach(function (asset, index) {
      const card = element("article", "asset-card");
      card.id = "asset-" + (index + 1);
      const identity = element("div", "asset-identity");
      identity.append(
        element("span", "eyebrow", asset.type),
        element("h2", "", asset.name),
        element("p", "material-name", "@" + asset.materialName),
        element("p", "", asset.summary),
        element("p", "muted", asset.identity),
        element("p", "readiness", asset.readiness)
      );
      const prompt = element("div", "asset-prompt");
      prompt.append(element("h3", "", "完整生图提示词"));
      const feedback = feedbackNode();
      const getText = function () { return asset.prompt; };
      prompt.append(copyButton("复制生图提示词", getText, feedback), feedback,
        promptDetails("展开完整生图提示词", getText(), "asset-prompt-" + (index + 1)));
      card.append(identity, prompt);
      list.appendChild(card);
    });
  }

  function renderSegments(data) {
    textAt("episode-title", data.episode);
    textAt("episode-overview", data.overview);
    textAt("video-model", data.videoModel);
    textAt("generation-mode", data.generationMode);
    textAt("mode-notice", data.modeNotice);
    const list = document.getElementById("segment-list");
    if (!list || !Array.isArray(data.segments)) return;
    data.segments.forEach(function (segment, index) {
      const card = element("article", "segment-card");
      card.id = "segment-" + (index + 1);
      const head = element("div", "segment-head");
      const heading = element("div");
      heading.append(element("h2", "", segment.id), element("p", "", segment.actionSummary));
      head.append(heading, element("span", "seconds", segment.seconds + "秒"));
      const shots = element("ul", "shot-list");
      (segment.shots || []).forEach(function (shot) {
        const line = element("li");
        line.append(element("strong", "", shot.label + " · " + shot.range), element("span", "", shot.summary));
        shots.appendChild(line);
      });
      const readiness = element("div", "reference-status");
      const state = referenceState(segment);
      readiness.append(
        element("p", "", "素材准备：" + segment.assetReadiness),
        element("p", "", state.label),
        element("p", "muted", state.detail)
      );
      const feedback = feedbackNode();
      const actions = element("div", "copy-actions");
      const getText = function () { return segment.modelPrompt; };
      actions.append(copyButton("复制分镜提示词", getText, feedback, function () {
        return "已复制完整分镜提示词；生成九格并实际挂载后，直接用同一稿生成视频。";
      }));
      card.append(head, shots, readiness, actions, feedback,
        promptDetails("展开完整分镜提示词", segment.modelPrompt, "model-prompt-" + (index + 1)));
      list.appendChild(card);
    });
  }

  function bindNavigation() {
    const frame = document.getElementById("production-workspace");
    if (frame) {
      function setModule(module) {
        const filename = MODULE_FILES[module];
        if (!filename) return;
        if (frame.getAttribute("src") !== filename) frame.setAttribute("src", filename);
        document.querySelectorAll(".workbench-nav [data-module]").forEach(function (link) {
          if (link.dataset.module === module) link.setAttribute("aria-current", "page");
          else link.removeAttribute("aria-current");
        });
      }
      document.querySelectorAll(".workbench-nav [data-module]").forEach(function (link) {
        link.addEventListener("click", function (event) {
          if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
          event.preventDefault();
          setModule(link.dataset.module);
        });
      });
      window.addEventListener("message", function (event) {
        const module = trustedModule(event, frame);
        if (module) setModule(module);
      });
      setModule("D");
      return;
    }
    const embedded = window.parent !== window && window.name === "production-workspace";
    if (embedded) {
      document.body.classList.add("is-embedded");
      document.querySelectorAll(".module-nav [data-module]").forEach(function (link) {
        link.addEventListener("click", function (event) {
          if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
          if (!Object.prototype.hasOwnProperty.call(MODULE_FILES, link.dataset.module)) return;
          event.preventDefault();
          window.parent.postMessage({ type: "su686:module", module: link.dataset.module }, "*");
        });
      });
    }
  }

  function boot() {
    const node = document.getElementById("su686-data");
    let data;
    try { data = node ? JSON.parse(node.textContent) : {}; }
    catch (_) {
      const error = element("p", "template-note", "页面数据读取失败，请检查本页材料后重试。");
      error.setAttribute("role", "alert");
      document.body.prepend(error);
      return;
    }
    document.querySelectorAll("[data-project-title]").forEach(function (title) { title.textContent = data.title || "本剧制作材料"; });
    bindNavigation();
    if (document.body.dataset.page === "B") renderAssets(data);
    if (document.body.dataset.page === "D") renderSegments(data);
  }

  window.Su686UI = Object.freeze({
    referenceState: referenceState,
    trustedModule: trustedModule,
    copyText: copyText
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
}());
