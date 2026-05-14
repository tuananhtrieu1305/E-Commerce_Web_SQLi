import { Truck, RotateCcw, Gift, Headphones, Lock } from "lucide-react";

export function FeaturesSection() {
  const features = [
    { icon: Truck, title: "Free shipping", desc: "On orders over ₫50" },
    { icon: RotateCcw, title: "Easy returns", desc: "Free within 30 days" },
    { icon: Gift, title: "Special gifts", desc: "Free with select orders" },
    { icon: Headphones, title: "Support 24/7", desc: "Help when you need it" },
    { icon: Lock, title: "Secured payment", desc: "100% safe" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-5 gap-4">
      {features.map((item, idx) => (
        <div
          key={idx}
          className="bg-white rounded-xl p-4 flex gap-3 shadow-sm hover:shadow-md transition"
        >
          <div className="bg-blue-50 p-3 rounded-lg flex-shrink-0">
            <item.icon size={20} className="text-blue-600" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-800 text-sm">
              {item.title}
            </h3>
            <p className="text-xs text-slate-500 truncate">{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
