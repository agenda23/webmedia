import React, { createContext, useContext, useState } from "react";

// タブコンテキスト
type TabsContextType = {
  activeTab: string;
  setActiveTab: (value: string) => void;
};

const TabsContext = createContext<TabsContextType | null>(null);

// Tabsコンポーネント
type TabsProps = {
  children: React.ReactNode;
  value: string;
  onValueChange?: (value: string) => void;
  className?: string;
};

export function Tabs({ 
  children, 
  value, 
  onValueChange, 
  className = "" 
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(value);
  
  // 外部制御とローカル状態の同期
  React.useEffect(() => {
    setActiveTab(value);
  }, [value]);
  
  // タブ変更ハンドラー
  const handleTabChange = (newValue: string) => {
    setActiveTab(newValue);
    if (onValueChange) {
      onValueChange(newValue);
    }
  };
  
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleTabChange }}>
      <div className={className}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

// TabsListコンポーネント
type TabsListProps = {
  children: React.ReactNode;
  className?: string;
};

export function TabsList({ children, className = "" }: TabsListProps) {
  return (
    <div className={`flex space-x-1 rounded-lg bg-gray-100 p-1 ${className}`}>
      {children}
    </div>
  );
}

// TabsTriggerコンポーネント
type TabsTriggerProps = {
  children: React.ReactNode;
  value: string;
  className?: string;
};

export function TabsTrigger({ children, value, className = "" }: TabsTriggerProps) {
  const context = useContext(TabsContext);
  
  if (!context) {
    throw new Error("TabsTrigger must be used within a Tabs component");
  }
  
  const { activeTab, setActiveTab } = context;
  const isActive = activeTab === value;
  
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      data-active={isActive}
      onClick={() => setActiveTab(value)}
      className={`inline-block rounded-md px-3 py-2 text-sm font-medium 
        ${isActive 
          ? "bg-white text-gray-900 shadow" 
          : "text-gray-700 hover:bg-gray-200 hover:text-gray-900"
        } ${className}`}
    >
      {children}
    </button>
  );
}

// TabsContentコンポーネント
type TabsContentProps = {
  children: React.ReactNode;
  value: string;
  className?: string;
};

export function TabsContent({ children, value, className = "" }: TabsContentProps) {
  const context = useContext(TabsContext);
  
  if (!context) {
    throw new Error("TabsContent must be used within a Tabs component");
  }
  
  const { activeTab } = context;
  
  if (activeTab !== value) {
    return null;
  }
  
  return (
    <div
      role="tabpanel"
      tabIndex={0}
      data-active={activeTab === value}
      className={className}
    >
      {children}
    </div>
  );
}
