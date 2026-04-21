import { createContext, useContext, useEffect, useState, ReactNode } from "react";
type Lang = "en"|"fil"|"ceb"|"ilo"|"kap";
const en = {
  "welcome.tagline":"Your cashless ticket to the road.","welcome.desc":"Fast, secure, and easy bus ticket booking for Manila-Baguio routes.","welcome.cta":"Get Started",
  "lang.title":"Choose your language","lang.subtitle":"You can change this later in your profile.","lang.continue":"Continue",
  "auth.signIn":"Sign in","auth.signUp":"Create account","auth.email":"Email","auth.password":"Password","auth.fullName":"Full name",
  "auth.phone":"Phone (e.g. +639171234567)","auth.continueWithGoogle":"Continue with Google","auth.sendOtp":"Send code",
  "auth.verifyOtp":"Verify code","auth.otp":"6-digit code","auth.haveAccount":"Already have an account?","auth.noAccount":"New here?",
  "auth.or":"or","auth.signupSuccess":"Account created. Please sign in.","auth.lockTitle":"Too many attempts",
  "auth.lockBody":"For your security, sign-in is paused for",
  "nav.home":"Home","nav.tickets":"Tickets","nav.wallet":"Wallet","nav.notif":"Alerts","nav.profile":"Profile",
  "home.hi":"Hello","home.book":"Book a trip","home.route":"Route","home.date":"Travel date","home.time":"Departure time",
  "home.seat":"Choose your seat","home.noTimes":"No more departures available for this date.","home.continue":"Continue to payment",
  "pay.title":"Payment","pay.method":"Choose payment method","pay.cash":"Cash on boarding","pay.gcash":"GCash","pay.wallet":"Wallet",
  "pay.confirm":"Confirm & book","pay.success":"Booking confirmed",
  "tickets.title":"My Tickets","tickets.empty":"You have no tickets yet.","tickets.upcoming":"Upcoming","tickets.past":"Past",
  "wallet.title":"Wallet","wallet.balance":"Balance","wallet.topup":"Top up","wallet.history":"Transactions","wallet.empty":"No transactions yet.",
  "notif.title":"Notifications","notif.empty":"You are all caught up.",
  "profile.title":"Profile","profile.save":"Save changes","profile.logout":"Log out","profile.version":"BusPay v1.0.0",
  "common.back":"Back","common.loading":"Loading...","common.cancel":"Cancel",
} as const;
type Key = keyof typeof en;
const fil:Record<Key,string> = {
  "welcome.tagline":"Iyong cashless tiket sa kalsada.","welcome.desc":"Mabilis, ligtas, at madaling pag-book ng tiket sa Manila-Baguio.","welcome.cta":"Magsimula",
  "lang.title":"Piliin ang iyong wika","lang.subtitle":"Maaari mo itong baguhin sa iyong profile.","lang.continue":"Magpatuloy",
  "auth.signIn":"Mag-sign in","auth.signUp":"Gumawa ng account","auth.email":"Email","auth.password":"Password","auth.fullName":"Buong pangalan",
  "auth.phone":"Telepono (hal. +639171234567)","auth.continueWithGoogle":"Ipagpatuloy gamit ang Google","auth.sendOtp":"Ipadala ang code",
  "auth.verifyOtp":"I-verify ang code","auth.otp":"6-digit na code","auth.haveAccount":"May account ka na?","auth.noAccount":"Bago ka rito?",
  "auth.or":"o","auth.signupSuccess":"Nagawa ang account. Mag-sign in na.","auth.lockTitle":"Sobrang dami ng pagsubok",
  "auth.lockBody":"Para sa iyong seguridad, naka-pause ang pag-sign in nang",
  "nav.home":"Bahay","nav.tickets":"Tiket","nav.wallet":"Wallet","nav.notif":"Alerto","nav.profile":"Profile",
  "home.hi":"Kumusta","home.book":"Mag-book ng biyahe","home.route":"Ruta","home.date":"Petsa ng biyahe","home.time":"Oras ng alis",
  "home.seat":"Piliin ang upuan","home.noTimes":"Wala nang available na biyahe para sa petsang ito.","home.continue":"Magpatuloy sa bayad",
  "pay.title":"Bayad","pay.method":"Piliin ang paraan ng bayad","pay.cash":"Cash sa pagsakay","pay.gcash":"GCash","pay.wallet":"Wallet",
  "pay.confirm":"Kumpirmahin at i-book","pay.success":"Nakumpirma ang booking",
  "tickets.title":"Aking Tiket","tickets.empty":"Wala ka pang tiket.","tickets.upcoming":"Paparating","tickets.past":"Nakaraan",
  "wallet.title":"Wallet","wallet.balance":"Balanse","wallet.topup":"Mag-top up","wallet.history":"Mga transaksyon","wallet.empty":"Wala pang transaksyon.",
  "notif.title":"Notipikasyon","notif.empty":"Walang bago para sa iyo.",
  "profile.title":"Profile","profile.save":"I-save","profile.logout":"Mag-logout","profile.version":"BusPay v1.0.0",
  "common.back":"Bumalik","common.loading":"Naglo-load...","common.cancel":"Kanselahin",
};
const ceb:Record<Key,string> = {
  "welcome.tagline":"Ang imong cashless tiket sa dalan.","welcome.desc":"Dali, luwas, ug sayon nga pag-book sa tiket alang sa Manila-Baguio.","welcome.cta":"Sugdi",
  "lang.title":"Pilia ang imong pinulongan","lang.subtitle":"Mabag-o nimo kini sa imong profile.","lang.continue":"Padayon",
  "auth.signIn":"Mag-sign in","auth.signUp":"Maghimo ug account","auth.email":"Email","auth.password":"Password","auth.fullName":"Tibuok ngalan",
  "auth.phone":"Telepono (ex. +639171234567)","auth.continueWithGoogle":"Padayon gamit ang Google","auth.sendOtp":"Ipadala ang code",
  "auth.verifyOtp":"I-verify ang code","auth.otp":"6-digit nga code","auth.haveAccount":"Naa na kay account?","auth.noAccount":"Bag-o ka dinhi?",
  "auth.or":"o","auth.signupSuccess":"Nahimo ang account. Mag-sign in na.","auth.lockTitle":"Daghan kaayong pagsulay",
  "auth.lockBody":"Para sa imong kaluwasan, naundang ang pag-sign in sulod sa",
  "nav.home":"Balay","nav.tickets":"Tiket","nav.wallet":"Pitaka","nav.notif":"Alerto","nav.profile":"Profile",
  "home.hi":"Kumusta","home.book":"Mag-book ug biyahe","home.route":"Ruta","home.date":"Petsa sa biyahe","home.time":"Oras sa pagbiya",
  "home.seat":"Pilia ang imong lingkoranan","home.noTimes":"Walay available nga biyahe para niining petsa.","home.continue":"Padayon sa bayad",
  "pay.title":"Bayad","pay.method":"Pilia ang pamaagi sa bayad","pay.cash":"Cash sa pagsakay","pay.gcash":"GCash","pay.wallet":"Pitaka",
  "pay.confirm":"Kumpirmaha ug i-book","pay.success":"Nakumpirma ang booking",
  "tickets.title":"Akong mga Tiket","tickets.empty":"Wala pa kay tiket.","tickets.upcoming":"Umaabot","tickets.past":"Nakalabay",
  "wallet.title":"Pitaka","wallet.balance":"Balanse","wallet.topup":"Mag-top up","wallet.history":"Mga transaksyon","wallet.empty":"Wala pay transaksyon.",
  "notif.title":"Mga Abiso","notif.empty":"Naa kay tanan.",
  "profile.title":"Profile","profile.save":"I-save","profile.logout":"Mag-logout","profile.version":"BusPay v1.0.0",
  "common.back":"Balik","common.loading":"Nag-load...","common.cancel":"Kansela",
};
const ilo:Record<Key,string> = {
  "welcome.tagline":"Ti cashless tiket mo iti dalan.","welcome.desc":"Napartak, naluwas, ken naalisto a pag-book ti tiket para Manila-Baguio.","welcome.cta":"Mangrugi",
  "lang.title":"Pilien ti pagsasaom","lang.subtitle":"Mabalinmo nga baliwan daytoy iti profile mo.","lang.continue":"Ituloy",
  "auth.signIn":"Mag-sign in","auth.signUp":"Mangited iti account","auth.email":"Email","auth.password":"Password","auth.fullName":"Bukbukel a nagan",
  "auth.phone":"Telepono (hal. +639171234567)","auth.continueWithGoogle":"Ituloy babaen ti Google","auth.sendOtp":"Ipatulod ti code",
  "auth.verifyOtp":"I-verify ti code","auth.otp":"6-digit a code","auth.haveAccount":"Adda account mo?","auth.noAccount":"Baro ka ditoy?",
  "auth.or":"wenno","auth.signupSuccess":"Naorasan ti account. Mag-sign in.","auth.lockTitle":"Adu unay ti pannornoram",
  "auth.lockBody":"Para iti kinasiguroan mo, napaputot ti pag-sign in iti",
  "nav.home":"Balay","nav.tickets":"Tiket","nav.wallet":"Pitaka","nav.notif":"Alerto","nav.profile":"Profile",
  "home.hi":"Kumusta","home.book":"Mag-book ti biahe","home.route":"Dalan","home.date":"Petsa ti biahe","home.time":"Oras ti panagbiahe",
  "home.seat":"Pilien ti upoam","home.noTimes":"Awan pay biahe para itoy a petsa.","home.continue":"Ituloy iti bayad",
  "pay.title":"Bayad","pay.method":"Pilien ti pamay-an ti bayad","pay.cash":"Cash iti panagsakay","pay.gcash":"GCash","pay.wallet":"Pitaka",
  "pay.confirm":"Ikompirma ken i-book","pay.success":"Nakompirma ti booking",
  "tickets.title":"Tiketko","tickets.empty":"Awan pay tiket mo.","tickets.upcoming":"Umay","tickets.past":"Napalabas",
  "wallet.title":"Pitaka","wallet.balance":"Balanse","wallet.topup":"Mag-top up","wallet.history":"Mga transaksyon","wallet.empty":"Awan pay transaksyon.",
  "notif.title":"Mga Pakabaelanan","notif.empty":"Naaramidmo ti amin.",
  "profile.title":"Profile","profile.save":"I-save","profile.logout":"Mag-logout","profile.version":"BusPay v1.0.0",
  "common.back":"Agsubli","common.loading":"Nag-load...","common.cancel":"Ikansela",
};
const kap:Record<Key,string> = {
  "welcome.tagline":"Ing cashless ticket mu king dalan.","welcome.desc":"Mabilis, ligtu, at malinis a pag-book ning tiket para Manila-Baguio.","welcome.cta":"Magsimula",
  "lang.title":"Miliin ing amanung salita mu","lang.subtitle":"Malyari mung baguhin iti king profile mu.","lang.continue":"Ituloy",
  "auth.signIn":"Mag-sign in","auth.signUp":"Gumawa ning account","auth.email":"Email","auth.password":"Password","auth.fullName":"Buong lagyu",
  "auth.phone":"Telepono (hal. +639171234567)","auth.continueWithGoogle":"Ituloy gamit ing Google","auth.sendOtp":"Ipadala ing code",
  "auth.verifyOtp":"I-verify ing code","auth.otp":"6-digit a code","auth.haveAccount":"Atin ka nang account?","auth.noAccount":"Baru ka keni?",
  "auth.or":"o","auth.signupSuccess":"Ginawa na ing account. Mag-sign in ka.","auth.lockTitle":"Dakal yang subukan",
  "auth.lockBody":"Para king katimawan mu, napitigil ing pag-sign in king loob ning",
  "nav.home":"Kebaybayan","nav.tickets":"Tiket","nav.wallet":"Pitaka","nav.notif":"Alerto","nav.profile":"Profile",
  "home.hi":"Kumusta","home.book":"Mag-book ning byayi","home.route":"Dalan","home.date":"Petsa ning byayi","home.time":"Oras ning byayi",
  "home.seat":"Miling upuan mu","home.noTimes":"Ala nang byayi para king petsa ngeni.","home.continue":"Ituloy king bayad",
  "pay.title":"Bayad","pay.method":"Miling paraan ning bayad","pay.cash":"Cash king pasakay","pay.gcash":"GCash","pay.wallet":"Pitaka",
  "pay.confirm":"Ikumpirma at i-book","pay.success":"Nakumpirma ing booking",
  "tickets.title":"Tiket ku","tickets.empty":"Ala ka pang tiket.","tickets.upcoming":"Marating","tickets.past":"Nakalabas",
  "wallet.title":"Pitaka","wallet.balance":"Balanse","wallet.topup":"Mag-top up","wallet.history":"Mga transaksyon","wallet.empty":"Ala pang transaksyon.",
  "notif.title":"Mga Abisu","notif.empty":"Kumpleto ka na.",
  "profile.title":"Profile","profile.save":"I-save","profile.logout":"Mag-logout","profile.version":"BusPay v1.0.0",
  "common.back":"Mauli","common.loading":"Nagluload...","common.cancel":"Kanselahin",
};
const dict={en,fil,ceb,ilo,kap};
interface I18nContextValue { lang:Lang; setLang:(l:Lang)=>void; t:(k:Key)=>string; }
const I18nContext = createContext<I18nContextValue|null>(null);
export function I18nProvider({children}:{children:ReactNode}) {
  const [lang,setLangState] = useState<Lang>(()=>{
    const s = typeof window!=="undefined" ? localStorage.getItem("buspay.lang") : null;
    return (s==="fil"||s==="ceb"||s==="ilo"||s==="kap") ? s as Lang : "en";
  });
  useEffect(()=>{ document.documentElement.lang=lang; },[lang]);
  const setLang=(l:Lang)=>{ setLangState(l); localStorage.setItem("buspay.lang",l); };
  const t=(k:Key):string=>{ const d=dict[lang] as Record<string,string>; return d[k]??(dict.en as Record<string,string>)[k]??k; };
  return <I18nContext.Provider value={{lang,setLang,t}}>{children}</I18nContext.Provider>;
}
export function useI18n() {
  const ctx=useContext(I18nContext);
  if(!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
