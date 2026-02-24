const ASSETS = [
  {
    id: 1,
    title: "Creative workspace",
    description: "A calm space for ideas and collaboration.",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop",
  },
  {
    id: 2,
    title: "Design system",
    description: "Consistent components and patterns for your product.",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=400&fit=crop",
  },
  {
    id: 3,
    title: "Collaboration",
    description: "Work together in real time with your team.",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop",
  },
  {
    id: 4,
    title: "Analytics dashboard",
    description: "Track metrics and insights at a glance.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
  },
  {
    id: 5,
    title: "Content library",
    description: "Store and organize your media assets.",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=400&fit=crop",
  },
  {
    id: 6,
    title: "Brand kit",
    description: "Logos, colors, and guidelines in one place.",
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop",
  },
];

const Assets = () => {
  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Assets</h1>
        <p className="text-slate-400 mt-1">Browse images and content cards.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {ASSETS.map((asset) => (
          <div
            key={asset.id}
            className="glass-card rounded-2xl overflow-hidden border border-slate-700/50 hover:border-cyan-500/30 transition-all duration-300 group animate-fade-in-up"
          >
            <div className="aspect-[3/2] overflow-hidden bg-slate-800/50">
              <img
                src={asset.image}
                alt={asset.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-5">
              <h3 className="font-semibold text-slate-100">{asset.title}</h3>
              <p className="text-sm text-slate-400 mt-1">{asset.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Assets;
