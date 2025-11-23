// https://developers.google.com/tag-platform/devguides/consent#gtag.js

type ConsentArg = 'default' | 'update';

type ConsentParams = {
  ad_storage?: 'granted' | 'denied';
  analytics_storage?: 'granted' | 'denied';
  ad_user_data?: 'granted' | 'denied';
  ad_personalization?: 'granted' | 'denied';
  wait_for_update?: number;
};

type ConsentOptions = {
  arg: ConsentArg;
  params: ConsentParams;
};

export function consent({ arg, params }: ConsentOptions): void {
  if (!window.gtag) {
    return;
  }
  window.gtag('consent', arg, params);
}
