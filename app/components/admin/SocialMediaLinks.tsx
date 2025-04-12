import React from "react";
import { FormField } from "~/components/ui/FormField";

type SocialMediaType = {
  twitter: string | null;
  facebook: string | null;
  instagram: string | null;
  youtube: string | null;
  line: string | null;
};

type SocialMediaLinksProps = {
  defaultValues?: SocialMediaType;
  errors?: any;
};

export function SocialMediaLinks({ defaultValues, errors }: SocialMediaLinksProps) {
  return (
    <div className="space-y-4">
      <FormField
        label="Twitter URL"
        name="socialMedia.twitter"
        type="url"
        placeholder="https://twitter.com/yourhandle"
        defaultValue={defaultValues?.twitter || ""}
        error={errors?.twitter?._errors[0]}
        helperText="Twitterアカウントの完全なURLを入力してください"
      />
      
      <FormField
        label="Facebook URL"
        name="socialMedia.facebook"
        type="url"
        placeholder="https://facebook.com/yourpage"
        defaultValue={defaultValues?.facebook || ""}
        error={errors?.facebook?._errors[0]}
        helperText="Facebookページの完全なURLを入力してください"
      />
      
      <FormField
        label="Instagram URL"
        name="socialMedia.instagram"
        type="url"
        placeholder="https://instagram.com/yourhandle"
        defaultValue={defaultValues?.instagram || ""}
        error={errors?.instagram?._errors[0]}
        helperText="Instagramアカウントの完全なURLを入力してください"
      />
      
      <FormField
        label="YouTube URL"
        name="socialMedia.youtube"
        type="url"
        placeholder="https://youtube.com/channel/yourchannelid"
        defaultValue={defaultValues?.youtube || ""}
        error={errors?.youtube?._errors[0]}
        helperText="YouTubeチャンネルの完全なURLを入力してください"
      />
      
      <FormField
        label="LINE URL"
        name="socialMedia.line"
        type="url"
        placeholder="https://line.me/yourpage"
        defaultValue={defaultValues?.line || ""}
        error={errors?.line?._errors[0]}
        helperText="LINE公式アカウントのURLを入力してください"
      />
    </div>
  );
}
