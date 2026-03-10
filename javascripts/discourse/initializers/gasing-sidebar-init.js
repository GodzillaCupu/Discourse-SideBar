import { withPluginApi } from "discourse/lib/plugin-api";

export default {
  name: "gasing-sidebar-init",
  initialize() {
    withPluginApi("1.0.0", (api) => {

      // ── 1. Disable Discourse's built-in sidebar ──────────────────────────
      // Discourse controls sidebar visibility via siteSettings and user prefs.
      // The safest cross-version way is to forcibly remove layout classes from
      // body and nuke the sidebar element after each render.
      const killDiscourseSidebar = () => {
        // Remove body classes that Discourse adds for its sidebar layout
        document.body.classList.remove(
          "has-sidebar-page",
          "sidebar-animate",
          "sidebar--visible"
        );
        // Also remove any inline styles Discourse may inject onto .wrap
        const wrap = document.querySelector(".wrap");
        if (wrap) {
          wrap.style.removeProperty("padding-left");
          wrap.style.removeProperty("margin-left");
        }
        const outlet = document.querySelector("#main-outlet-wrapper");
        if (outlet) {
          outlet.style.removeProperty("padding-left");
          outlet.style.removeProperty("margin-left");
        }
      };

      // ── 2. Sync our sidebar collapse state → body class ─────────────────
      let sidebarObserver = null;

      const syncCollapseState = () => {
        const sidebar = document.querySelector(".gs-sidebar");
        if (!sidebar) return;

        // Disconnect previous observer if any
        if (sidebarObserver) {
          sidebarObserver.disconnect();
        }

        sidebarObserver = new MutationObserver(() => {
          const isCollapsed = sidebar.classList.contains("gs-sidebar--collapsed");
          document.body.classList.toggle("gs-collapsed", isCollapsed);
          killDiscourseSidebar();
        });

        sidebarObserver.observe(sidebar, {
          attributes: true,
          attributeFilter: ["class"],
        });

        // Set initial state
        const isCollapsed = sidebar.classList.contains("gs-sidebar--collapsed");
        document.body.classList.toggle("gs-collapsed", isCollapsed);
      };

      // Run on every page change (Ember router transition)
      api.onPageChange(() => {
        requestAnimationFrame(() => {
          killDiscourseSidebar();
          syncCollapseState();
        });
      });

      // Run immediately on first load
      requestAnimationFrame(() => {
        killDiscourseSidebar();
        syncCollapseState();
      });
    });
  },
};
