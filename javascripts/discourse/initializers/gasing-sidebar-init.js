import { withPluginApi } from "discourse/lib/plugin-api";

export default {
  name: "gasing-sidebar-init",
  initialize() {
    withPluginApi("1.0.0", (api) => {
      // Observe mutations on the sidebar element to sync body class
      // (used for CSS padding-left on body)
      const sync = () => {
        const sidebar = document.querySelector(".gs-sidebar");
        if (!sidebar) return;

        const observer = new MutationObserver(() => {
          const isCollapsed = sidebar.classList.contains("gs-sidebar--collapsed");
          document.body.classList.toggle("gs-collapsed", isCollapsed);
        });

        observer.observe(sidebar, {
          attributes: true,
          attributeFilter: ["class"],
        });

        // Set initial state
        const isCollapsed = sidebar.classList.contains("gs-sidebar--collapsed");
        document.body.classList.toggle("gs-collapsed", isCollapsed);
      };

      // Wait for Ember to render
      api.onPageChange(() => {
        requestAnimationFrame(sync);
      });

      // Also run on first load
      requestAnimationFrame(sync);
    });
  },
};
