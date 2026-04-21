import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
type Lang = "en"|"fil"|"ceb"|"ilo"|"kap";
const OPTIONS:{code:Lang;label:string;native:string;flag:string}[] = [
  {code:"en", label:"English",     native:"English",     flag:"🇬🇧"},
  {code:"fil",label:"Filipino",    native:"Filipino",    flag:"🇵🇭"},
  {code:"ceb",label:"Cebuano",     native:"Sinugbuanon", flag:"🇵🇭"},
  {code:"ilo",label:"Ilocano",     native:"Ilokano",     flag:"🇵🇭"},
  {code:"kap",label:"Kapampangan", native:"Kapampangan", flag:"🇵🇭"},
];
export default function Language() {
  const {t,lang,setLang}=useI18n();
  const navigate=useNavigate();
  const [selected,setSelected]=useState<Lang>(lang as Lang);
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-8">
        <header className="mb-10 animate-fade-in"><Logo /></header>
        <section className="flex-1">
          <h1 className="mb-2 text-3xl font-extrabold animate-slide-up">{t("lang.title")}</h1>
          <p className="mb-8 text-muted-foreground animate-slide-up" style={{animationDelay:"60ms"}}>{t("lang.subtitle")}</p>
          <div className="space-y-3">
            {OPTIONS.map((opt,i)=>(
              <button key={opt.code} onClick={()=>setSelected(opt.code)}
                className={cn("flex w-full items-center gap-4 rounded-2xl border-2 bg-card p-4 text-left transition-all animate-slide-up",
                  selected===opt.code?"border-accent bg-accent/5 shadow-soft":"border-border hover:border-accent/40")}
                style={{animationDelay:`${120+i*50}ms`}}>
                <span className="text-2xl">{opt.flag}</span>
                <div className="flex-1">
                  <div className="font-bold">{opt.label}</div>
                  <div className="text-sm text-muted-foreground">{opt.native}</div>
                </div>
                {selected===opt.code&&(
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-accent-foreground">
                    <Check className="h-4 w-4" strokeWidth={3}/>
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>
        <Button variant="navy" size="lg" onClick={()=>{setLang(selected);navigate("/auth");}} className="mt-6 w-full">
          {t("lang.continue")}
        </Button>
      </div>
    </main>
  );
}
