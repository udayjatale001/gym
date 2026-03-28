
"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Utensils, Search, Flame, Zap, Plus, Coffee, Sun, Sunset, Moon } from "lucide-react";

const indianFoodDB = [
  { name: "Paneer Tikka (4 pcs)", cal: 320, pro: 18 },
  { name: "Dal Tadka (1 bowl)", cal: 180, pro: 12 },
  { name: "Roti (1 piece)", cal: 85, pro: 3 },
  { name: "Chicken Curry (1 bowl)", cal: 450, pro: 35 },
  { name: "Brown Rice (1 bowl)", cal: 215, pro: 5 },
  { name: "Oats with Milk", cal: 280, pro: 14 },
];

const meals = [
  { time: "Breakfast", icon: Coffee, items: ["Oats with Milk", "Banana"], total: 380 },
  { time: "Lunch", icon: Sun, items: ["Dal Tadka", "2 Roti", "Salad"], total: 350 },
  { time: "Snack", icon: Sunset, items: ["Roasted Makhana"], total: 120 },
  { time: "Dinner", icon: Moon, items: ["Chicken Curry", "1 Roti"], total: 535 },
];

export default function DietPage() {
  const [search, setSearch] = useState("");

  const filteredFood = indianFoodDB.filter(food => 
    food.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold flex items-center gap-2 text-secondary-foreground">
          <Utensils className="h-6 w-6 text-secondary" />
          Diet Logger
        </h2>
        <p className="text-xs text-muted-foreground">Track calories & protein intake.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-primary/5 border-none">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-xl">
              <Flame className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Calories</p>
              <p className="text-lg font-black">1,385</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-secondary/5 border-none">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-secondary/10 p-2 rounded-xl">
              <Zap className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Protein</p>
              <p className="text-lg font-black">84g</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search food (e.g. Paneer Tikka)" 
          className="pl-10 h-12 rounded-full border-muted bg-card shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && filteredFood.length > 0 && (
          <Card className="absolute top-14 left-0 w-full z-10 overflow-hidden shadow-xl border-border">
            <div className="divide-y divide-border">
              {filteredFood.map((food, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="text-sm font-bold">{food.name}</p>
                    <p className="text-[10px] text-muted-foreground">{food.cal} kcal | {food.pro}g protein</p>
                  </div>
                  <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-primary/10 text-primary">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      <section className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Today's Meals</h3>
        <div className="space-y-3">
          {meals.map((meal, idx) => (
            <div key={idx} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                  <meal.icon className="h-5 w-5" />
                </div>
                {idx !== meals.length - 1 && <div className="w-0.5 bg-muted flex-1 my-1"></div>}
              </div>
              <div className="flex-1 pb-4">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-sm">{meal.time}</h4>
                  <p className="text-xs font-black text-primary">{meal.total} kcal</p>
                </div>
                <p className="text-xs text-muted-foreground italic">
                  {meal.items.join(", ")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
