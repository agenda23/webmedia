import React from "react";
import { FormField } from "~/components/ui/FormField";

// 都道府県リスト
const prefectures = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"
];

type AddressData = {
  zipCode: string;
  prefecture: string;
  city: string;
  street: string;
  building?: string | null;
};

type AddressFormProps = {
  defaultValue?: AddressData;
  errors?: any;
};

export function AddressForm({ defaultValue, errors }: AddressFormProps) {
  // 郵便番号を入力して住所を自動入力する機能
  // この例では実装していませんが、実際には郵便番号APIを使用できます
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        label="郵便番号"
        name="address.zipCode"
        type="text"
        placeholder="123-4567"
        required
        defaultValue={defaultValue?.zipCode}
        error={errors?.zipCode?._errors[0]}
        helperText="ハイフンを含めて入力してください"
      />
      
      <FormField
        label="都道府県"
        name="address.prefecture"
        as="select"
        required
        defaultValue={defaultValue?.prefecture}
        error={errors?.prefecture?._errors[0]}
      >
        <option value="">選択してください</option>
        {prefectures.map((pref) => (
          <option key={pref} value={pref}>
            {pref}
          </option>
        ))}
      </FormField>
      
      <FormField
        label="市区町村"
        name="address.city"
        type="text"
        required
        defaultValue={defaultValue?.city}
        error={errors?.city?._errors[0]}
      />
      
      <FormField
        label="番地"
        name="address.street"
        type="text"
        required
        defaultValue={defaultValue?.street}
        error={errors?.street?._errors[0]}
      />
      
      <FormField
        label="建物名・部屋番号"
        name="address.building"
        type="text"
        className="md:col-span-2"
        defaultValue={defaultValue?.building || ""}
        error={errors?.building?._errors[0]}
      />
    </div>
  );
}
