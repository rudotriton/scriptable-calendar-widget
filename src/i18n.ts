import formatString from "formatString"

const translation: {[key: string]: TranslationKeys} = {
  en: {
    today: 'Today',
    tomorrow: 'Tomorrow',
    daysAfter: '{0} days after'
  },
  zh_CN: {
    today: '今天',
    tomorrow: '明天',
    daysAfter: '{0}天后'
  },
  zh: {
    today: '今天',
    tomorrow: '明天',
    daysAfter: '{0}天後'
  },
  ja: {
    today: '今日',
    tomorrow: '明日',
    daysAfter: '{0}日後'
  }
}

interface TranslationKeys {
  today: string,
  tomorrow: string,
  daysAfter: string,
}

function tr<K extends keyof TranslationKeys>(locale: string, key: K, ...args: any[]): string {
  locale = locale.replace('-', '_');
  let trValue: string;
  if (locale in translation) {
    trValue = translation[locale][key];
  } else if (locale.split('_')[0] in translation) {
    trValue = translation[locale.split('_')[0]][key];
  } else {
    trValue = translation['en'][key];
  }
  if (args.length)
    return formatString(trValue, ...args);
  else
    return trValue;
}

export default tr;