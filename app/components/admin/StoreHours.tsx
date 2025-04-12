import React from "react";

type HourData = {
  day: string;
  isOpen: boolean;
  openTime: string | null;
  closeTime: string | null;
};

type StoreHoursProps = {
  businessHours: HourData[];
  onChange: (hours: HourData[]) => void;
};

export function StoreHours({ businessHours, onChange }: StoreHoursProps) {
  // 各曜日の営業状態を更新
  const updateDayStatus = (dayIndex: number, isOpen: boolean) => {
    const updatedHours = [...businessHours];
    updatedHours[dayIndex] = {
      ...updatedHours[dayIndex],
      isOpen,
    };
    onChange(updatedHours);
  };

  // 営業開始時間を更新
  const updateOpenTime = (dayIndex: number, time: string) => {
    const updatedHours = [...businessHours];
    updatedHours[dayIndex] = {
      ...updatedHours[dayIndex],
      openTime: time,
    };
    onChange(updatedHours);
  };

  // 営業終了時間を更新
  const updateCloseTime = (dayIndex: number, time: string) => {
    const updatedHours = [...businessHours];
    updatedHours[dayIndex] = {
      ...updatedHours[dayIndex],
      closeTime: time,
    };
    onChange(updatedHours);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700 mb-2">
        <div className="col-span-2">曜日</div>
        <div className="col-span-2">営業状態</div>
        <div className="col-span-4">開店時間</div>
        <div className="col-span-4">閉店時間</div>
      </div>
      
      {businessHours.map((hour, index) => (
        <div key={hour.day} className="grid grid-cols-12 gap-4 items-center">
          <div className="col-span-2 font-medium">{hour.day}</div>
          
          <div className="col-span-2">
            <select
              value={hour.isOpen ? "open" : "closed"}
              onChange={(e) => updateDayStatus(index, e.target.value === "open")}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="open">営業</option>
              <option value="closed">休業</option>
            </select>
          </div>
          
          <div className="col-span-4">
            <input
              type="time"
              value={hour.openTime || ""}
              onChange={(e) => updateOpenTime(index, e.target.value)}
              disabled={!hour.isOpen}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-400"
            />
          </div>
          
          <div className="col-span-4">
            <input
              type="time"
              value={hour.closeTime || ""}
              onChange={(e) => updateCloseTime(index, e.target.value)}
              disabled={!hour.isOpen}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-400"
            />
          </div>
        </div>
      ))}
      
      <div className="text-sm text-gray-500 mt-4">
        <p>※ 24時間営業の場合は、開店時間を00:00、閉店時間を23:59としてください。</p>
      </div>
    </div>
  );
}
