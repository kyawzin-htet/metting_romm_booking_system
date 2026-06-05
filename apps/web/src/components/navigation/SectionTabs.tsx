import { useLayoutEffect, useRef, useState } from "react";
import type { Tab } from "../../types/domain";

const tabLabels: Record<Tab, string> = {
  bookings: "Bookings",
  analytics: "Analytics",
  users: "User Management"
};

type SectionTabsProps = {
  activeTab: Tab;
  visibleTabs: Tab[];
  onChange: (tab: Tab) => void;
};

export function SectionTabs({ activeTab, visibleTabs, onChange }: SectionTabsProps) {
  const tabRefs = useRef<Record<Tab, HTMLButtonElement | null>>({
    bookings: null,
    analytics: null,
    users: null
  });
  const [tabIndicator, setTabIndicator] = useState({ left: 3, width: 0 });

  useLayoutEffect(() => {
    function updateIndicator() {
      const activeNode = tabRefs.current[activeTab];
      const tabList = activeNode?.parentElement;

      if (!activeNode || !tabList) {
        return;
      }

      const activeRect = activeNode.getBoundingClientRect();
      const listRect = tabList.getBoundingClientRect();
      setTabIndicator({
        left: activeRect.left - listRect.left,
        width: activeRect.width
      });
    }

    updateIndicator();
    window.addEventListener("resize", updateIndicator);

    return () => window.removeEventListener("resize", updateIndicator);
  }, [activeTab, visibleTabs]);

  return (
    <nav className="tabs" aria-label="Sections">
      <span
        className="tab-indicator"
        style={{
          width: tabIndicator.width,
          transform: `translateX(${tabIndicator.left}px)`
        }}
      />
      {visibleTabs.map((tab) => (
        <button
          key={tab}
          ref={(node) => {
            tabRefs.current[tab] = node;
          }}
          type="button"
          className={activeTab === tab ? "active" : ""}
          onClick={() => onChange(tab)}
        >
          {tabLabels[tab]}
        </button>
      ))}
    </nav>
  );
}
