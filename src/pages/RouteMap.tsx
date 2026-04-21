import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, Bus } from "lucide-react";
import { Logo } from "@/components/Logo";
const STOPS=[
  {name:"Manila - Cubao Terminal",time:"Departure: 6:00 AM / 9:00 AM / 1:00 PM / 6:00 PM",note:"Main departure — EDSA Cubao, Quezon City"},
  {name:"Dau / Mabalacat",time:"+1h 30m",note:"Optional stop — MacArthur Highway, Pampanga"},
  {name:"Tarlac City",time:"+2h 00m",note:"Rest stop — Tarlac City center"},
  {name:"Rosario / La Union",time:"+4h 00m",note:"Approaching Cordillera region"},
  {name:"Baguio City Terminal",time:"+6h 00m",note:"Final destination — Gov. Pack Road, Baguio City"},
];
export default function RouteMap() {
  const navigate=useNavigate();
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-6 py-8">
        <header className="mb-6 flex items-center gap-4">
          <button onClick={()=>navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-border hover:bg-secondary"><ArrowLeft className="h-4 w-4"/></button>
          <Logo/>
        </header>
        <h1 className="mb-2 text-3xl font-extrabold">Route Map</h1>
        <p className="mb-6 text-sm text-muted-foreground">Manila to Baguio and back — approximately 250 km</p>
        <div className="mb-6 overflow-hidden rounded-2xl border border-border shadow-soft">
          <iframe title="Manila to Baguio Route" width="100%" height="300" loading="lazy"
            style={{border:0}} referrerPolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps/embed?pb=!1m28!1m12!1m3!1d982695.3971823!2d120.19!3d15.98!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m13!3e0!4m5!1s0x3397ca03571ec38b%3A0x69d1d8bb2f5c0f6e!2sCubao%20Bus%20Terminal%2C%20Quezon%20City!3m2!1d14.6198!2d121.0535!4m5!1s0x3391949de54d8b4b%3A0xce0a6e33a0d50c27!2sBaguio%20City!3m2!1d16.4023!2d120.5960!5e0!3m2!1sen!2sph!4v1"/>
        </div>
        <div className="mb-6 grid grid-cols-3 gap-3">
          {[{icon:MapPin,label:"Distance",value:"~250 km"},{icon:Clock,label:"Travel Time",value:"~6 hours"},{icon:Bus,label:"Fare",value:"₱580"}].map(({icon:Icon,label,value})=>(
            <div key={label} className="rounded-2xl border border-border bg-card p-4 text-center">
              <Icon className="mx-auto mb-2 h-5 w-5 text-accent"/>
              <div className="text-xs text-muted-foreground">{label}</div>
              <div className="font-bold">{value}</div>
            </div>
          ))}
        </div>
        <h2 className="mb-4 font-bold">Manila to Baguio Stops</h2>
        <div className="space-y-0">
          {STOPS.map((stop,i)=>(
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 ${i===0||i===STOPS.length-1?"border-accent bg-accent text-accent-foreground":"border-border bg-card"}`}>
                  {i===0||i===STOPS.length-1?<MapPin className="h-4 w-4"/>:<span className="text-xs font-bold text-muted-foreground">{i}</span>}
                </div>
                {i<STOPS.length-1&&<div className="my-1 w-0.5 flex-1 bg-border" style={{minHeight:32}}/>}
              </div>
              <div className="pb-6">
                <div className="font-semibold">{stop.name}</div>
                <div className="text-xs text-accent font-medium">{stop.time}</div>
                <div className="text-xs text-muted-foreground">{stop.note}</div>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 rounded-2xl bg-secondary p-4 text-xs text-muted-foreground">
          Actual stops and travel times may vary depending on traffic and weather. The route shown is for reference only.
        </p>
      </div>
    </main>
  );
}
