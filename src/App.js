



import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);


// ▶ personal constants for BMR calculation
const heightCm = 170;
const birthDate = new Date(1990, 8, 21);  // Sep 21, 1990
const isMale = true;
function App() {
  const [screen, setScreen] = useState("home");
  const [calories, setCalories] = useState(() => parseInt(localStorage.getItem("calories")) || 0);
  const [protein, setProtein] = useState(() => parseInt(localStorage.getItem("protein")) || 0);
  const [steps, setSteps] = useState(() => parseInt(localStorage.getItem("steps")) || 0);
  // ▶ default deficit goal to saved override or personal threshold
const [deficitGoal, setDeficitGoal] = useState(() => {
  const saved = parseInt(localStorage.getItem("deficitGoal"), 10);
  return !isNaN(saved) ? saved : 500;  // ✅ fallback to 500 instead of calorieThreshold
});

  const [proteinGoal, setProteinGoal] = useState(() => parseFloat(localStorage.getItem("proteinGoal")) || 140);
const [fat, setFat] = useState(() => parseFloat(localStorage.getItem("fat")) || 0);
const [carbs, setCarbs] = useState(() => parseFloat(localStorage.getItem("carbs")) || 0);
const [fiber, setFiber] = useState(() => parseFloat(localStorage.getItem("fiber")) || 0);
const [water, setWater] = useState(() => parseInt(localStorage.getItem("water")) || 0);

// 🧠 Daily macro/water goals
const [mode, setMode] = useState(() => localStorage.getItem("mode") || "Cut");
const [showModes, setShowModes] = useState(false);

const [fatGoal, setFatGoal] = useState(
  () => parseFloat(localStorage.getItem("fatGoal")) || 50
);
const [carbGoal, setCarbGoal] = useState(
  () => parseFloat(localStorage.getItem("carbGoal")) || 120
);
const fiberGoal = 25;
const waterGoal = 3; // bottles of 27oz (~2.5L)
  const [stepGoal] = useState(10000);
  const [checklist, setChecklist] = useState(() => JSON.parse(localStorage.getItem("checklist")) || {
  supplements: false,
  sunlight: false,
  concentrace: false,
  teffilin: false
});
const allChecklistItemsComplete = Object.values(checklist).every(Boolean);
  const [foodLog, setFoodLog] = useState(() => JSON.parse(localStorage.getItem("foodLog")) || []);
  const [workoutLog, setWorkoutLog] = useState(() => JSON.parse(localStorage.getItem("workoutLog")) || {});
  const [weightLog, setWeightLog] = useState(() => JSON.parse(localStorage.getItem("weightLog")) || []);
  const [newWeight, setNewWeight] = useState("");

  // ▶ compute age
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;

  // ▶ latest weight (lbs)
  const latestWeight = weightLog.length > 0 ? weightLog[weightLog.length - 1].weight : null;

  // ▶ true BMR via Mifflin–St Jeor
  const bmr = latestWeight
    ? Math.round(
        10 * (latestWeight / 2.20462) +  // lbs → kg
        6.25 * heightCm -
        5 * age +
        (isMale ? 5 : -161)
      )
    : null;

  // ▶ unified threshold: BMR or fallback 1600
  const calorieThreshold = bmr || 1600;

  const [customFood, setCustomFood] = useState({ name: "", cal: "", prot: "", fat: "", carbs: "", fiber: "" });
  const [customWorkout, setCustomWorkout] = useState({});
  const [customSteps, setCustomSteps] = useState("");
  const [foodSearch,   setFoodSearch]   = useState("");

  const workouts = {
  "Leg Press": 0.4,
  "Bench Press": 0.3,
  "Pull-ups": 0.4,
  "Shoulder Press": 0.3,
  "Low Pull": 0.3,
  "Lunges": 0.4,
  "Hamstring Curl": 0.3,
  "Glute Abductor": 0.3,
  "Back Extensions": 0.3,
  "Core Pull": 0.2,
  "Biceps": 0.2,
  "Triceps": 0.3,
  "Push-ups": 0.3,
  "Plank": 0.04,
  "Run": "run",
  "Bike": "bike"
};
  
const foodOptions = [
  { name: "Apple", cal: 95, prot: 1, fat: 0.3, carbs: 25, fiber: 4.4 },
  { name: "Avocado (half)", cal: 120, prot: 1.5, fat: 10, carbs: 6, fiber: 5 },
  { name: "Avocado (whole)", cal: 240, prot: 3, fat: 20, carbs: 12, fiber: 10 },
  { name: "Banana (half)", cal: 53, prot: 0.6, fat: 0.2, carbs: 13.5, fiber: 1.6 },
  { name: "Banana (whole)", cal: 105, prot: 1.3, fat: 0.4, carbs: 27, fiber: 3.1 },
  { name: "Blueberries (½ cup)", cal: 42, prot: 0.6, fat: 0.25, carbs: 10.7, fiber: 1.8 },
  { name: "Blueberries (1 cup)", cal: 84, prot: 1.1, fat: 0.5, carbs: 21.4, fiber: 3.6 },
  { name: "Brazil nut", cal: 33, prot: 0.75, fat: 3.4, carbs: 0.6, fiber: 0.2 },
  { name: "Bread (sourdough rye slice 56g)", cal: 145, prot: 4.5, fat: 1.0, carbs: 27, fiber: 3.3 },
  { name: "Butter (1 tsp)", cal: 35, prot: 0, fat: 4, carbs: 0, fiber: 0 },
  { name: "Carrot (50g)", cal: 21, prot: 0.5, fat: 0.1, carbs: 5, fiber: 1.4 },
  { name: "Carrot (100g)", cal: 41, prot: 0.9, fat: 0.2, carbs: 10, fiber: 2.8 },
  { name: "Carrot (150g)", cal: 62, prot: 1.4, fat: 0.3, carbs: 15, fiber: 4.2 },
  { name: "Carrots Peas and Corn (frozen, 100g)", cal: 63, prot: 3, fat: 1.1, carbs: 10, fiber: 4 },
  { name: "Cheese (Parmesan 10g)", cal: 43, prot: 3.8, fat: 2.9, carbs: 0.4, fiber: 0 },
  { name: "Cheese (Parmesan 20g)", cal: 86, prot: 7.6, fat: 5.8, carbs: 0.8, fiber: 0 },
  { name: "Cheese (Parmesan 25g)", cal: 108, prot: 9.5, fat: 7.3, carbs: 1, fiber: 0 },
  { name: "Cheese (Parmesan 30g)", cal: 129, prot: 11.4, fat: 8.7, carbs: 1.2, fiber: 0 },
  { name: "Cheese (Parmesan 50g)", cal: 216, prot: 19, fat: 14.5, carbs: 2, fiber: 0 },
  { name: "Chia pudding (2 tbsp chia + 3/4 cup almond milk)", cal: 206, prot: 5, fat: 9, carbs: 12, fiber: 10 },
  { name: "Chia seeds (1 tbsp)", cal: 58, prot: 2, fat: 3.7, carbs: 5.1, fiber: 4.1 },
  { name: "Chicken breast (50g)", cal: 82, prot: 15, fat: 1.8, carbs: 0, fiber: 0 },
  { name: "Chicken breast (100g)", cal: 165, prot: 31, fat: 3.6, carbs: 0, fiber: 0 },
  { name: "Chicken breast (150g)", cal: 248, prot: 46, fat: 5.4, carbs: 0, fiber: 0 },
  { name: "Chicken breast (200g)", cal: 330, prot: 62, fat: 7.2, carbs: 0, fiber: 0 },
  { name: "Corn (100g)", cal: 85, prot: 2.2, fat: 1.3, carbs: 15.3, fiber: 1.5 },
  { name: "Cottage cheese 5% (50g)", cal: 48, prot: 5.5, fat: 2.5, carbs: 0.8, fiber: 0 },
  { name: "Cottage cheese 5% (100g)", cal: 95, prot: 11, fat: 5, carbs: 1.5, fiber: 0 },
  { name: "Cottage cheese 5% (250g full tub)", cal: 238, prot: 27.5, fat: 12.5, carbs: 3.8, fiber: 0 },
  { name: "Cucumber", cal: 16, prot: 1, fat: 0.1, carbs: 4, fiber: 0.5 },
  { name: "Date (1 Medjool)", cal: 66, prot: 0.4, fat: 0.1, carbs: 18, fiber: 1.6 },
  { name: "Egg", cal: 70, prot: 6, fat: 5, carbs: 0.6, fiber: 0 },
  { name: "Egg white", cal: 15, prot: 3, fat: 0, carbs: 0.2, fiber: 0 },
  { name: "Eggs (2) + butter", cal: 175, prot: 12, fat: 13, carbs: 0.6, fiber: 0 },
  { name: "Eggs (2), Egg white (1) + butter", cal: 190, prot: 15, fat: 13, carbs: 0.8, fiber: 0 },
  { name: "Flax seeds (1 tbsp)", cal: 55, prot: 2, fat: 4.3, carbs: 3, fiber: 2.8 },
  { name: "Green onions", cal: 5, prot: 0, fat: 0, carbs: 1, fiber: 0.3 },
  { name: "Green beans (100g, roasted, no oil)", cal: 38, prot: 2.2, fat: 0.4, carbs: 8, fiber: 3.6 },
  { name: "Green beans (200g, roasted, no oil)", cal: 76, prot: 4.4, fat: 0.8, carbs: 16, fiber: 7.2 },
  { name: "Green beans (300g, roasted, no oil)", cal: 114, prot: 6.6, fat: 1.2, carbs: 24, fiber: 10.8 },
  { name: "Ground beef 90/10 (50g)", cal: 73, prot: 9.3, fat: 4, carbs: 0, fiber: 0 },
  { name: "Ground beef 90/10 (100g)", cal: 145, prot: 18.6, fat: 8, carbs: 0, fiber: 0 },
  { name: "Ground beef 90/10 (150g)", cal: 218, prot: 27.9, fat: 12, carbs: 0, fiber: 0 },
  { name: "Ground beef 90/10 (200g)", cal: 290, prot: 37.2, fat: 16, carbs: 0, fiber: 0 },
  { name: "Honey (1 tsp)", cal: 15, prot: 0, fat: 0, carbs: 4, fiber: 0 },
  { name: "Honey (1 tbsp)", cal: 45, prot: 0, fat: 0, carbs: 12, fiber: 0 },
  { name: "Hummus (100g)", cal: 170, prot: 7, fat: 10, carbs: 14, fiber: 4 },
  { name: "Israeli salad (large)", cal: 100, prot: 2, fat: 0.5, carbs: 10, fiber: 3 },
  { name: "Israeli salad (medium)", cal: 70, prot: 1.5, fat: 0.3, carbs: 7, fiber: 2 },
  { name: "Israeli salad (small)", cal: 40, prot: 1, fat: 0.2, carbs: 4, fiber: 1 },
  { name: "Maple syrup (1 tsp)", cal: 17, prot: 0, fat: 0, carbs: 4.5, fiber: 0 },
  { name: "Maple syrup (1 tbsp)", cal: 52, prot: 0, fat: 0, carbs: 13.4, fiber: 0 },
  { name: "Oats (¼ cup)", cal: 73, prot: 2.4, fat: 1.7, carbs: 11.2, fiber: 2.4 },
  { name: "Olive oil (1 tsp)", cal: 40, prot: 0, fat: 4.7, carbs: 0, fiber: 0 }, 
  { name: "Olive oil (½ tbsp)", cal: 60, prot: 0, fat: 7.0, carbs: 0, fiber: 0 }, 
  { name: "Olive oil (1 tbsp)", cal: 120, prot: 0, fat: 14, carbs: 0, fiber: 0 },
  { name: "Oreo (1 cookie)", cal: 52, prot: 0.35, fat: 2.15, carbs: 7.5, fiber: 0.05 },
  { name: "Oreo (2 cookies)", cal: 104, prot: 0.7, fat: 4.3, carbs: 15, fiber: 0.1 },
  { name: "Peanut butter (1 tsp)", cal: 47, prot: 2, fat: 4, carbs: 2, fiber: 0.5 },
  { name: "Peanut butter (1 tbsp)", cal: 94, prot: 4, fat: 8, carbs: 3, fiber: 1 },
  { name: "Peanut butter (PBfit 1 tbsp)", cal: 30, prot: 4, fat: 1, carbs: 3, fiber: 1 },
  { name: "Peanut butter (PBfit 2 tbsp)", cal: 60, prot: 8, fat: 2, carbs: 6, fiber: 2 },
  { name: "Peas (frozen, 50g)", cal: 37, prot: 3.5, fat: 0.8, carbs: 5.3, fiber: 2.6 },
  { name: "Peas (frozen, 100g)", cal: 73, prot: 6.9, fat: 1.5, carbs: 10.5, fiber: 5.1 },
  { name: "Peas (frozen, 150g)", cal: 110, prot: 10.4, fat: 2.3, carbs: 15.8, fiber: 7.7 },
  { name: "Peas (frozen, 200g)", cal: 146, prot: 13.8, fat: 3.0, carbs: 21.0, fiber: 10.2 },
  { name: "Pita (½)",  cal: 138, prot: 4.6, fat: 0.6, carbs: 27.9, fiber: 1.1 },
  { name: "Pita (full)", cal: 275, prot: 9.1, fat: 1.2, carbs: 55.7, fiber: 2.2 },
  { name: "Potato (50g)", cal: 43, prot: 1, fat: 0, carbs: 10, fiber: 1 },
  { name: "Potato (100g)", cal: 86, prot: 2, fat: 0, carbs: 20, fiber: 2 },
  { name: "Potato (150g)", cal: 129, prot: 3, fat: 0, carbs: 30, fiber: 3 },
  { name: "Potato (200g)", cal: 172, prot: 4, fat: 0, carbs: 40, fiber: 4 },
  { name: "Protein bar (promix vanilla)", cal: 150, prot: 15, fat: 3, carbs: 17, fiber: 5 },
  { name: "Protein bar (maxx)", cal: 217, prot: 21, fat: 6.8, carbs: 20, fiber: 3.9 },
  { name: "Protein bar (quest chocolate peanut butter)", cal: 190, prot: 20, fat: 9, carbs: 22, fiber: 11 },
  { name: "Protein bar (quest cookie dough)", cal: 190, prot: 21, fat: 9, carbs: 21, fiber: 12 },
  { name: "Protein bar (quest mini cookie dough)", cal: 80, prot: 8, fat: 3.5, carbs: 9, fiber: 3 },
  { name: "Protein chips (quest)", cal: 140, prot: 20, fat: 4.5, carbs: 4, fiber: 1 },
  { name: "Protein Ice Cream (Peanut Butter Banana)", cal: 498, prot: 55.3, fat: 9.2, carbs: 51.4, fiber: 4.1 },
  { name: "Protein pancakes (kodiak ½ cup)", cal: 220, prot: 14, fat: 2, carbs: 30, fiber: 3 },
  { name: "Protein scoop (1 Promix Chocolate)", cal: 80, prot: 15.5, fat: 0.75, carbs: 4.5 },
  { name: "Protein scoop (2 Promix Chocolate)", cal: 160, prot: 31, fat: 1.5, carbs: 9 },
  { name: "Protein scoop (1 Promix Unflavored)", cal: 65, prot: 15, fat: 0.25, carbs: 1 },
  { name: "Protein scoop (2 Promix Unflavored)", cal: 130, prot: 30, fat: 0.5, carbs: 2 },
  { name: "Protein scoop (1 Promix Vanilla)", cal: 75, prot: 15, fat: 0.25, carbs: 3.5 },
  { name: "Protein scoop (2 Promix Vanilla)", cal: 150, prot: 30, fat: 0.5, carbs: 7 },
  { name: "Pumpkin seeds (1 tsp)", cal: 20, prot: 1, fat: 1.5, carbs: 0.7, fiber: 0.4 },
  { name: "Pumpkin seeds (1 tbsp)", cal: 60, prot: 3, fat: 4.5, carbs: 2, fiber: 1.1 },
  { name: "Rice (50g cooked)", cal: 65, prot: 1.3, fat: 0.1, carbs: 14, fiber: 0.2 },
  { name: "Rice (100g cooked)", cal: 130, prot: 2.6, fat: 0.2, carbs: 28, fiber: 0.4 },
  { name: "Rice (150g cooked)", cal: 195, prot: 3.9, fat: 0.3, carbs: 42, fiber: 0.6 },
  { name: "Rice (200g cooked)", cal: 260, prot: 5.2, fat: 0.4, carbs: 56, fiber: 0.8 },
  { name: "Salmon (85g wild sockeye pouch)", cal: 100, prot: 17, fat: 3.5, carbs: 0, fiber: 0 },
  { name: "Salmon (50g)", cal: 103, prot: 11, fat: 6.5, carbs: 0, fiber: 0 },
  { name: "Salmon (100g)", cal: 206, prot: 22, fat: 13, carbs: 0, fiber: 0 },
  { name: "Salmon (150g)", cal: 309, prot: 33, fat: 19.5, carbs: 0, fiber: 0 },
  { name: "Salmon (200g)", cal: 412, prot: 44, fat: 26, carbs: 0, fiber: 0 },
  { name: "Spinach (frozen, 100g)", cal: 28, prot: 3.2, fat: 0.5, carbs: 3.2, fiber: 3.0 },
  { name: "Spinach (handful)", cal: 15, prot: 1.5, fat: 0.3, carbs: 2, fiber: 1 },
  { name: "Strawberries (½ cup)", cal: 25, prot: 0.5, fat: 0.25, carbs: 5.9, fiber: 1.5 },
  { name: "Strawberries (1 cup)", cal: 49, prot: 1, fat: 0.5, carbs: 11.7, fiber: 3 },
  { name: "Sweet potato (50g)", cal: 43, prot: 1, fat: 0, carbs: 10, fiber: 1.5 },
  { name: "Sweet potato (100g)", cal: 86, prot: 2, fat: 0.1, carbs: 20, fiber: 3 },
  { name: "Sweet potato (150g)", cal: 129, prot: 3, fat: 0.2, carbs: 30, fiber: 4.5 },
  { name: "Sweet potato (200g)", cal: 172, prot: 4, fat: 0.2, carbs: 40, fiber: 6 },
  { name: "Tomato", cal: 20, prot: 1, fat: 0.2, carbs: 5, fiber: 1.5 },
  { name: "Tuna (150g)", cal: 156, prot: 37.2, fat: 0.9, carbs: 0, fiber: 0 },
  { name: "Walnut", cal: 26, prot: 0.6, fat: 2.6, carbs: 0.6, fiber: 0.3 },
  { name: "Walnuts (3)", cal: 78, prot: 1.8, fat: 7.8, carbs: 1.8, fiber: 0.9 },
  { name: "Water (27oz)", cal: 0, prot: 0, fat: 0, carbs: 0, fiber: 0, water: 1 },
  { name: "Watermelon triangle", cal: 50, prot: 1, fat: 0.2, carbs: 12, fiber: 0.6 },
  { name: "Yogurt 0%", cal: 117, prot: 20, fat: 0.3, carbs: 6, fiber: 0 }
];


  const totalBurn = Object.entries(workoutLog).reduce((sum, [type, value]) => {
  if (typeof value === "object" && value !== null && typeof value.cal === "number") {
    return sum + value.cal;
  }
  if (type === "Swim") return sum + Math.round(value * 7);
  if (type === "Plank") return sum + Math.round(value * 0.04);
  if (workouts[type]) return sum + Math.round(value * workouts[type]);
  return sum;
}, 0)

const estimatedDeficit = calorieThreshold + totalBurn - calories;

useEffect(() => {
  localStorage.setItem("calories", calories);
  localStorage.setItem("protein", protein);
  localStorage.setItem("fat", fat);
  localStorage.setItem("carbs", carbs);
  localStorage.setItem("fiber", fiber);
  localStorage.setItem("water", water);
  localStorage.setItem("steps", steps);
  localStorage.setItem("deficitGoal", deficitGoal);
  localStorage.setItem("proteinGoal", proteinGoal);
  localStorage.setItem("checklist", JSON.stringify(checklist));
  localStorage.setItem("foodLog", JSON.stringify(foodLog));
  localStorage.setItem("workoutLog", JSON.stringify(workoutLog));
  localStorage.setItem("weightLog", JSON.stringify(weightLog));
    localStorage.setItem("fatGoal", fatGoal);
    localStorage.setItem("carbGoal", carbGoal);
    localStorage.setItem("mode", mode);
}, [calories, protein, fat, carbs, fiber, water, steps, deficitGoal, proteinGoal, checklist, foodLog, workoutLog, fatGoal, carbGoal, mode, checklist, foodLog, workoutLog, weightLog]);


  // 🛠️ Whenever mode changes, override the home-page goals
  useEffect(() => {
    if (mode === "Cut") {
      setProteinGoal(140);
      setFatGoal(50);
      setCarbGoal(120);
      setDeficitGoal(500);
    } else if (mode === "Maintenance") {
      setProteinGoal(140);
      setFatGoal(55);
      setCarbGoal(160);
      setDeficitGoal(0);
    } else { // Bulk
      setProteinGoal(150);
      setFatGoal(60);
      setCarbGoal(200);
      setDeficitGoal(-100);
    }
  }, [mode]);

  const resetDay = () => {
  const confirmReset = window.confirm("Are you sure?");
  if (!confirmReset) return;

  setCalories(0);
  setProtein(0);
  (0);
  setFat(0);
  setCarbs(0);
  setFiber(0);
  setWater(0);
  setSteps(0);
  setFoodLog([]);
  setWorkoutLog({});
  setChecklist({ supplements: false, sunlight: false, concentrace: false, teffilin: false});

  // Optional: clear localStorage for those too
  localStorage.removeItem("calories");
  localStorage.removeItem("protein");
  localStorage.removeItem("steps");
  localStorage.removeItem("fat");
  localStorage.removeItem("carbs");
  localStorage.removeItem("fiber");
  localStorage.removeItem("water");
  localStorage.removeItem("foodLog");
  localStorage.removeItem("workoutLog");
  localStorage.removeItem("checklist");
};

  // ❗️Do NOT remove "weightLog" – it stays

const logWorkout = (type, reps) => {
  let burn;
  if (type === "Plank") {
    burn = Math.round(reps * 0.04); // ~2.4 cal/min
  } else {
    burn = Math.round(workouts[type] * reps);
  }

  setWorkoutLog(prev => {
    const updated = { ...prev };
    updated[type] = (updated[type] || 0) + reps;
    return updated;
  });

  if (type === "Steps") {
  setSteps(prev => prev + reps);
}

  if (type === "Run") {
    const runSteps = Math.round(reps * 800);
    setSteps(prev => prev + runSteps);
  }
};


  const deleteWorkout = (type) => {
  const reps = workoutLog[type];

  // Calculate burn (optional – only needed if displayed or used elsewhere)
  const burn =
  type === "Run"
    ? Math.round(reps * 65)
    : type === "Steps"
    ? Math.round(reps * 0.04)
    : type === "Plank"
    ? Math.round(reps * 0.04)
    : Math.round(reps * workouts[type]);

  // ✅ Fix step count reversals
  if (type === "Steps") {
  const stepCount = workoutLog["Steps"]?.reps || 0;
  setSteps(prev => Math.max(0, prev - stepCount));
}

if (type === "Run") {
  const stepCount = workoutLog["Run"]?.stepsAdded || 0;
  setSteps(prev => Math.max(0, prev - stepCount));
}

  if (type === "Treadmill" && reps?.steps) {
  setSteps(prev => Math.max(0, prev - reps.steps));
}

  setWorkoutLog((prev) => {
    const updated = { ...prev };
    delete updated[type];
    return updated;
  });
};


  const addFood = (food) => {
  const completeFood = {
    name: food.name || "Unnamed",
    cal: parseInt(food.cal) || 0,
    prot: parseInt(food.prot) || 0,
    fat: parseFloat(food.fat) || 0,
    carbs: parseFloat(food.carbs) || 0,
    fiber: parseFloat(food.fiber) || 0,
    water: parseInt(food.water) || 0, // 👈 Add this line
    time: food.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  if (!completeFood.name || isNaN(completeFood.cal) || isNaN(completeFood.prot)) {
    console.error("Invalid food entry:", food);
    return;
  }

  setFoodLog(prev => [...prev, completeFood]);
  setCalories(prev => prev + completeFood.cal);
  setProtein(prev => prev + completeFood.prot);
  setFat(prev => prev + completeFood.fat);
  setCarbs(prev => prev + completeFood.carbs);
  setFiber(prev => prev + completeFood.fiber);
  if (completeFood.water > 0) {
    setWater(prev => prev + completeFood.water); // ✅ This syncs water log to homepage
  }
};
  
const deleteFood = (index) => {
  const item = foodLog[index];
  if (!item) return;

  setFoodLog(prev => prev.filter((_, i) => i !== index));
  setCalories(prev => prev - (item.cal || 0));
  setProtein(prev => prev - (item.prot || 0));
  setFat(prev => prev - (item.fat || 0));
  setCarbs(prev => prev - (item.carbs || 0));
  setFiber(prev => prev - (item.fiber || 0));
  setWater(prev => prev - (item.water || 0)); // ✅ ADDED
};

  const addWeight = () => {
    const weight = parseFloat(newWeight);
    if (!isNaN(weight)) {
      setWeightLog([...weightLog, { date: new Date().toLocaleDateString(), weight }]);
      setNewWeight("");
    }
  };

  const deleteWeight = (i) => {
    setWeightLog(weightLog.filter((_, idx) => idx !== i));
  };

  const avgWeight =
    weightLog.length === 0
      ? 0
      : weightLog.reduce((acc, w) => acc + w.weight, 0) / weightLog.length;

  const overviewStyle = {
    fontSize: "16px",
    margin: "4px 0"
  };

const navBtnStyle = {
  fontSize: "16px",
  padding: "10px",
  margin: "6px 0",
  borderRadius: "10px",
  width: "100%",
  backgroundColor: "#eee",
  color: "#0070f3",
  border: "none"
};

  const HomeButton = () => (
  <button onClick={() => setScreen("home")} style={navBtnStyle}>⬅️ Home</button>
);

const inputStyleFull = {
  flex: "1 1 100%",
  maxWidth: "100%",
  padding: "10px",
  fontSize: "16px",
  borderRadius: "8px",
  border: "1px solid #ccc"
};

const inputStyleThird = {
  flex: "1 1 calc(33.333% - 12px)",
  padding: "10px",
  fontSize: "16px",
  borderRadius: "8px",
  border: "1px solid #ccc"
};

if (screen === "food") {
  return (
    <>
      <div style={{
        position:        "fixed",
        top:             0,
        left:            0,
        right:           0,
        height:          "56px",
        backgroundColor: "#fff",
        borderBottom:    "1px solid #ddd",
        boxShadow:       "0 1px 4px rgba(0,0,0,0.1)",
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "center",
        zIndex:          100
      }}>
        <button onClick={() => setScreen("home")} style={{
          border:     "none",
          background: "transparent",
          fontSize:   "18px",
          cursor:     "pointer"
        }}>
          🏠 Home
        </button>
      </div>

      <div style={{
        padding:       "24px",
        paddingTop:    "58px",
        paddingBottom: "80px",
        fontFamily:    "Inter, Arial, sans-serif",
        maxWidth:      "500px",
        margin:        "auto"
      }}>
        <h1 style={{
          fontSize:    "24px",
          fontWeight:  "bold",
          textAlign:   "center",
          marginBottom:"16px"
        }}>
          🍽️ Food Log
        </h1>

        {/* ← the rest of your Food UI goes here unchanged */}

      <div style={{ marginBottom: "20px" }}>
{/* 👇 search filter input */}
<div
  style={{
    display:       "flex",
    alignItems:    "center",
    justifyContent:"center",
    marginBottom:  "12px",
  }}
>
  <div
    style={{
      position: "relative",
      width:    "85%",
      maxWidth: "400px"  // optional cap on how wide it grows
    }}
  >
    <input
      type="text"
      placeholder="🔍 Search foods…"
      value={foodSearch}
      onChange={e => setFoodSearch(e.target.value)}
      style={{
        width:        "100%",
        padding:      "10px 32px 10px 10px",
        fontSize:     "16px",
        borderRadius: "8px",
        border:       "1px solid #ccc",
        boxSizing:    "border-box",
      }}
    />
    <button
      onClick={() => setFoodSearch("")}
      style={{
        position:     "absolute",
        right:        "10px",
        top:          "50%",
        transform:    "translateY(-50%)",
        border:       "none",
        background:   "transparent",
        fontSize:     "16px",
        cursor:       "pointer",
      }}
    >
      ✖
    </button>
  </div>
</div>

        <select
          defaultValue=""
          onChange={(e) => {
            const selected = JSON.parse(e.target.value);
            addFood({ ...selected, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
            e.target.value = "";
          }}
          style={{
            width: "100%",
            padding: "12px",
            fontSize: "16px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            backgroundColor: "#fff"
          }}
        >
          <option value="" disabled>Select Food</option>
{foodOptions
.filter(f =>
f.name.toLowerCase().includes(foodSearch.toLowerCase())
)
.map((f, i) => (
<option key={i} value={JSON.stringify(f)}>
{f.name}
</option>
))
}
        </select>
      </div>

     <div style={{ marginBottom: "24px" }}>
    {/* six inputs in a 3×2 grid, each 80% wide */}
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: "8px",
      marginBottom: "12px",
      justifyItems: "center",
    }}
  >
    <input
      placeholder="Custom food"
      value={customFood.name}
      onChange={e => setCustomFood({ ...customFood, name: e.target.value })}
      style={{
        padding: "12px",
        width: "80%",
        borderRadius: "8px",
        border: "1px solid #ccc",
      }}
    />
    <input
      placeholder="Calories"
      type="number"
      value={customFood.cal}
      onChange={e => setCustomFood({ ...customFood, cal: e.target.value })}
      style={{
        padding: "12px",
        width: "80%",
        borderRadius: "8px",
        border: "1px solid #ccc",
      }}
    />
    <input
      placeholder="Protein"
      type="number"
      value={customFood.prot}
      onChange={e => setCustomFood({ ...customFood, prot: e.target.value })}
      style={{
        padding: "12px",
        width: "80%",
        borderRadius: "8px",
        border: "1px solid #ccc",
      }}
    />
    <input
      placeholder="Fat"
      type="number"
      value={customFood.fat}
      onChange={e => setCustomFood({ ...customFood, fat: e.target.value })}
      style={{
        padding: "12px",
        width: "80%",
        borderRadius: "8px",
        border: "1px solid #ccc",
      }}
    />
    <input
      placeholder="Carbs"
      type="number"
      value={customFood.carbs}
      onChange={e => setCustomFood({ ...customFood, carbs: e.target.value })}
      style={{
        padding: "12px",
        width: "80%",
        borderRadius: "8px",
        border: "1px solid #ccc",
      }}
    />
    <input
      placeholder="Fiber"
      type="number"
      value={customFood.fiber}
      onChange={e => setCustomFood({ ...customFood, fiber: e.target.value })}
      style={{
        padding: "12px",
        width: "80%",
        borderRadius: "8px",
        border: "1px solid #ccc",
      }}
    />
  </div>

        <button
          onClick={() => {
  const { name, cal, prot, fat, carbs, fiber } = customFood;

  const parsedCal = parseInt(cal);
  const parsedProt = parseInt(prot);
  const parsedFat = fat !== "" && !isNaN(parseFloat(fat)) ? parseFloat(fat) : undefined;
  const parsedCarbs = carbs !== "" && !isNaN(parseFloat(carbs)) ? parseFloat(carbs) : undefined;
  const parsedFiber = fiber !== "" && !isNaN(parseFloat(fiber)) ? parseFloat(fiber) : undefined;

  if (name && !isNaN(parsedCal) && !isNaN(parsedProt)) {
    setCalories(c => c + parsedCal);
    setProtein(p => p + parsedProt);
    if (parsedFat !== undefined) setFat(f => f + parsedFat);
    if (parsedCarbs !== undefined) setCarbs(c => c + parsedCarbs);
    if (parsedFiber !== undefined) setFiber(f => f + parsedFiber);

    setFoodLog(f => [
      ...f,
      {
        name,
        cal: parsedCal,
        prot: parsedProt,
        ...(parsedFat !== undefined && { fat: parsedFat }),
        ...(parsedCarbs !== undefined && { carbs: parsedCarbs }),
        ...(parsedFiber !== undefined && { fiber: parsedFiber }),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    setCustomFood({
      name: "",
      cal: "",
      prot: "",
      fat: "",
      carbs: "",
      fiber: ""
    });
  }
}}

          style={{
            padding: "10px 16px",
            backgroundColor: "#0070f3",
            color: "white",
            fontSize: "16px",
            border: "none",
            borderRadius: "8px",
            width: "100%"
          }}
        >
          Add Custom Food
        </button>
      </div>

      <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "12px" }}>Logged Foods</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
  {foodLog.map((f, i) => (
    <li key={i} style={{ fontSize: "16px", marginBottom: "6px" }}>
      {f.time && <strong style={{ marginRight: "6px", color: "#888" }}>{f.time}</strong>}
      {f.name} — {f.cal} cal, {f.prot}g protein
      {f.fat ? `, ${f.fat}g fat` : ""}
      {f.carbs ? `, ${f.carbs}g carbs` : ""}
      {f.fiber ? `, ${f.fiber}g fiber` : ""}
      <button onClick={() => deleteFood(i)} style={{ marginLeft: "8px" }}>❌</button>
    </li>
  ))}
</ul>
    
<div style={{
  marginTop:     "24px",
  backgroundColor:"#f1f1f1",
  padding:       "12px 16px",
  borderRadius:  "10px",
  display:       "flex",
  flexDirection: "column",
  gap:           "8px",
  fontSize:      "16px",
  fontWeight:    "600",
  color:         "#333"
}}>
  <div style={{
    textAlign: "center",
    fontSize:  "20px",
    fontWeight:"700"
  }}>
    Calories: {calories} cal
  </div>

  <div style={{
    display:        "flex",
    justifyContent: "space-between"
  }}>
    <div>Protein: {Math.round(protein * 10) / 10} g</div>
    <div>Carbs:   {Math.round(carbs   * 10) / 10} g</div>
  </div>

  <div style={{
    display:        "flex",
    justifyContent: "space-between"
  }}>
    <div>Fat:   {Math.round(fat   * 10) / 10} g</div>
    <div>Fiber: {Math.round(fiber * 10) / 10} g</div>
  </div>
</div>
      
</div>
{/* — Fixed Bottom Tab Bar — */}
        <div style={{
          position:     "fixed",
          bottom:       0,
          left:         0,
          right:        0,
          display:      "flex",
          height:       "56px",
          backgroundColor: "#fff",
          borderTop:    "1px solid #ddd",
          boxShadow:    "0 -1px 4px rgba(0,0,0,0.1)"
        }}>
          <button onClick={() => setScreen("food")}     style={{ flex:1,border:"none",background:"transparent",fontSize:"16px",cursor:"pointer" }}>🍽️ Food</button>
          <button onClick={() => setScreen("workouts")} style={{ flex:1,border:"none",background:"transparent",fontSize:"16px",cursor:"pointer" }}>🏋️ Workouts</button>
          <button onClick={() => setScreen("weight")}   style={{ flex:1,border:"none",background:"transparent",fontSize:"16px",cursor:"pointer" }}>⚖️ Weight</button>
        </div>
      </>
    );
  }

  if (screen === "workouts") {
  return (
    <>
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "56px",
        backgroundColor: "#fff",
        borderBottom: "1px solid #ddd",
        boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100
      }}>
        <button onClick={() => setScreen("home")} style={{
          border:     "none",
          background: "transparent",
          fontSize:   "18px",
          cursor:     "pointer"
        }}>
          🏠 Home
        </button>
      </div>

      <div style={{
        padding:       "24px",
        paddingTop:    "58px",
        paddingBottom: "80px",
        fontFamily:    "Inter, Arial, sans-serif",
        maxWidth:      "500px",
        margin:        "auto"
      }}>
        <h1 style={{
          fontSize:    "24px",
          fontWeight:  "bold",
          textAlign:   "center",
          marginBottom:"12px"
        }}>
          🏋️ Workouts
        </h1>

      {/* Strength + Run entries */}
      {Object.keys(workouts).map((type, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          <label style={{ width: "100px", fontSize: "16px" }}>{type}</label>
          <input
  type="number"
  step={type === "Run" ? "0.01" : "1"}
  placeholder={(
  type === "Run" || type === "Bike"
    ? "Kilometers"
    : type === "Plank"
    ? "Seconds"
    : type === "Swim"
    ? "Laps"
    : "Reps"
)}

  value={customWorkout[type] || ""}
  onChange={(e) =>
    setCustomWorkout({ ...customWorkout, [type]: e.target.value })
  }
  style={{ width: "100px", padding: "8px", fontSize: "16px", borderRadius: "8px", border: "1px solid #ccc" }}
/>
          <button
            onClick={() => {
  const input = parseFloat(customWorkout[type]);
  if (!isNaN(input)) {
    // --- NEW: handle Bike rides
if (type === "Bike") {
const cal = Math.round(input * 15);        // 15 cal/km
setWorkoutLog(prev => ({
...prev,
[type]: { reps: input, cal }
}));
setCustomWorkout({ ...customWorkout, [type]: "" });
return;
}
// existing Run handling
if (type === "Run") {
  const cal = Math.round(input * 70);
  const runSteps = Math.round(input * 800);

  setSteps(prev => prev + runSteps);

  setWorkoutLog(prev => ({
    ...prev,
    [type]: {
      reps: input,
      cal,
      stepsAdded: runSteps
    }
  }));

  setCustomWorkout({ ...customWorkout, [type]: "" });
  return; // Exit early
}

    // fallback for other reps-based workouts
setWorkoutLog(prev => ({
...prev,
[type]: (prev[type] || 0) + input
}));
    setCustomWorkout({ ...customWorkout, [type]: "" });
  }
}}
            style={{
              padding: "8px 12px",
              fontSize: "16px",
              backgroundColor: "#0070f3",
              color: "white",
              border: "none",
              borderRadius: "8px"
            }}
          >
            Add
          </button>
        </div>
      ))}

      {/* Steps section - separate from workouts */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
        <label style={{ width: "100px", fontSize: "16px" }}>Steps</label>
        <input
          type="number"
          placeholder="Steps"
          value={customWorkout["Steps"] || ""}
          onChange={(e) =>
            setCustomWorkout({ ...customWorkout, Steps: e.target.value })
          }
          style={{ width: "100px", padding: "8px", fontSize: "16px", borderRadius: "8px", border: "1px solid #ccc" }}
        />
        <button
          onClick={() => {
            const steps = parseInt(customWorkout["Steps"]);
            if (!isNaN(steps)) {
              const stepCalories = Math.round(steps * 0.035); // updated: 0.035 kcal/step
              setSteps(prev => {
  const newSteps = prev + steps;
  localStorage.setItem("steps", newSteps.toString());
  return newSteps;
});
 // steps tracker
              setWorkoutLog(prev => ({
  ...prev,
  Steps: {
    reps: (prev["Steps"]?.reps || 0) + steps,
    cal: Math.round(((prev["Steps"]?.reps || 0) + steps) * 0.035)
  }
}));
              setCustomWorkout({ ...customWorkout, Steps: "" });
            }
          }}
          style={{
            padding: "8px 12px",
            fontSize: "16px",
            backgroundColor: "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "8px"
          }}
        >
          Add
        </button>
      </div>

{/* Treadmill Entry */}
<div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
  <label style={{ width: "100px", fontSize: "16px" }}>Treadmill</label>
  
  <input
    type="number"
    placeholder="Cal"
    value={customWorkout.treadCal || ""}
    onChange={(e) => setCustomWorkout({ ...customWorkout, treadCal: e.target.value })}
    style={{
      width: "43px", // 🔻 halved
      height: "23.5px",
      padding: "6px",
      fontSize: "14px",
      borderRadius: "8px",
      border: "1px solid #ccc",
    }}
  />
  
  <input
    type="number"
    placeholder="KM"
    step="0.01"
    value={customWorkout.treadKm || ""}
    onChange={(e) => setCustomWorkout({ ...customWorkout, treadKm: e.target.value })}
    style={{
      width: "39.125px", // 🔻 halved
      height: "23.5px",
      padding: "6px",
      fontSize: "14px",
      borderRadius: "8px",
      border: "1px solid #ccc",
    }}
  />
  
  <button
    onClick={() => {
      const cal = parseInt(customWorkout.treadCal);
      const km = parseFloat(customWorkout.treadKm);
      if (!isNaN(cal) && !isNaN(km)) {
        const estimatedSteps = Math.round(km * 1250);
        setSteps(prev => {
  const newSteps = prev + estimatedSteps;
  return newSteps;
});

        setWorkoutLog(prev => ({
  ...prev,
  Treadmill: {
    cal: (prev.Treadmill?.cal || 0) + cal,
    steps: (prev.Treadmill?.steps || 0) + estimatedSteps
  }
}));
        setCustomWorkout({ ...customWorkout, treadCal: "", treadKm: "" });
      }
    }}
    style={{
      padding: "8px 12px",
      fontSize: "16px",
      backgroundColor: "#0070f3",
      color: "white",
      border: "none",
      borderRadius: "8px"
    }}
  >
    Add
  </button>
</div>

{/* Swim Entry (50m laps, 7 cal/lap) */}
<div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
  <label style={{ width: "100px", fontSize: "16px" }}>Swim</label>

  <input
    type="number"
    placeholder="Laps"
    value={customWorkout["Swim"] || ""}
    onChange={(e) => setCustomWorkout({ ...customWorkout, Swim: e.target.value })}
    style={{
      width: "100px",
      padding: "8px",
      fontSize: "16px",
      borderRadius: "8px",
      border: "1px solid #ccc",
    }}
  />

  <button
    onClick={() => {
      const laps = parseInt(customWorkout["Swim"]);
      if (!isNaN(laps)) {
        const cal = Math.round(laps * 7); // 7 cal per 50m lap
        setWorkoutLog(prev => ({
          ...prev,
          Swim: (prev.Swim || 0) + laps
        }));
        setCustomWorkout({ ...customWorkout, Swim: "" });
      }
    }}
    style={{
      padding: "8px 12px",
      fontSize: "16px",
      backgroundColor: "#0070f3",
      color: "white",
      border: "none",
      borderRadius: "8px"
    }}
  >
    Add
  </button>
</div>

        {/* Logged Workouts */}
        <>
          <h2 style={{ fontSize: "20px", fontWeight: "600", marginTop: "24px", marginBottom: "12px" }}>
            Logged Workouts
          </h2>
          <ul style={{ paddingLeft: "16px", marginBottom: "16px" }}>
            {Object.entries(workoutLog).map(([type, value], i) => {
              let display = "";

              // Object-type entries (Run, Steps, Bike, Treadmill…)
              if (typeof value === "object" && value !== null) {
                const reps = value.reps ?? 0;
                const cal = value.cal ?? 0;
                const steps = value.stepsAdded ?? value.steps ?? 0;
                if (type === "Treadmill") {
                  display = `${cal} cal, ${steps} steps`;
                } else if (type === "Run") {
                  display = `${reps} km – ${cal} cal, ${steps} steps`;
                } else if (type === "Steps") {
                  display = `${reps} steps – ${cal} cal`;
                } else if (type === "Bike") {
                  display = `${reps} km – ${cal} cal`;
                } else {
                  display = `${reps} reps – ${cal} cal`;
                }

              // Number-type entries (Swim, Plank, or other reps)
              } else if (type === "Swim") {
                const laps = value;
                const cal = Math.round(laps * 7);
                display = `${laps} laps – ${cal} cal`;
              } else if (type === "Plank") {
                const cal = Math.round(value * 0.04);
                display = `${value} sec – ${cal} cal`;
              } else if (workouts[type]) {
                const cal = Math.round(value * workouts[type]);
                display = `${value} reps – ${cal} cal`;
              } else {
                display = `${value} reps – ${Math.round(value * (workouts[type] || 1))} cal`;
              }

              return (
                <li key={i} style={{ fontSize: "16px", marginBottom: "6px" }}>
                  {type}: {display}
                  <button onClick={() => deleteWorkout(type)} style={{ marginLeft: "8px" }}>
                    ❌
                  </button>
                </li>
              );
            })}
          </ul>
          <div style={{
            backgroundColor: "#f1f1f1",
            padding: "12px 16px",
            borderRadius: "10px",
            textAlign: "center",
            fontSize: "18px",
            fontWeight: "bold"
          }}>
            Total Burn: {
              Object.entries(workoutLog).reduce((sum, [type, value]) => {
                if (typeof value === "object" && value !== null && typeof value.cal === "number") {
                  return sum + value.cal;
                }
                if (type === "Swim") return sum + Math.round(value * 7);
                if (type === "Plank") return sum + Math.round(value * 0.04);
                if (workouts[type]) return sum + Math.round(value * workouts[type]);
                return sum;
              }, 0)
            } cal
          </div>
        </>

    </div>
 {/* — Fixed Bottom Tab Bar — */}
        <div style={{
          position:     "fixed",
          bottom:       0,
          left:         0,
          right:        0,
          display:      "flex",
          height:       "56px",
          backgroundColor: "#fff",
          borderTop:    "1px solid #ddd",
          boxShadow:    "0 -1px 4px rgba(0,0,0,0.1)"
        }}>
          <button onClick={() => setScreen("food")}     style={{ flex:1,border:"none",background:"transparent",fontSize:"16px",cursor:"pointer" }}>🍽️ Food</button>
          <button onClick={() => setScreen("workouts")} style={{ flex:1,border:"none",background:"transparent",fontSize:"16px",cursor:"pointer" }}>🏋️ Workouts</button>
          <button onClick={() => setScreen("weight")}   style={{ flex:1,border:"none",background:"transparent",fontSize:"16px",cursor:"pointer" }}>⚖️ Weight</button>
        </div>
      </>
    );
  }

  if (screen === "weight") {
  const latestWeight = weightLog.length > 0 ? weightLog[weightLog.length - 1].weight : "—";
  const latestDate = weightLog.length > 0 ? weightLog[weightLog.length - 1].date : "";

  const data = {
    labels: weightLog.map((w) => w.date),
    datasets: [
      {
        label: "Weight (lbs)",
        data: weightLog.map((w) => w.weight),
        borderColor: "#0070f3",
        backgroundColor: "#0070f3",
        fill: false,
        tension: 0.3,
      },
    ],
  };

  return (
    <>
      <div style={{
        position:        "fixed",
        top:             0,
        left:            0,
        right:           0,
        height:          "56px",
        backgroundColor: "#fff",
        borderBottom:    "1px solid #ddd",
        boxShadow:       "0 1px 4px rgba(0,0,0,0.1)",
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "center",
        zIndex:          100
      }}>
        <button onClick={() => setScreen("home")} style={{
          border:     "none",
          background: "transparent",
          fontSize:   "18px",
          cursor:     "pointer"
        }}>
          🏠 Home
        </button>
      </div>

      <div style={{
        padding:       "24px",
        paddingTop:    "58px",
        paddingBottom: "80px",
        fontFamily:    "Inter, Arial, sans-serif",
        maxWidth:      "500px",
        margin:        "auto"
      }}>
        <h1 style={{
          fontSize:    "24px",
          fontWeight:  "bold",
          textAlign:   "center",
          marginBottom:"12px"
        }}>
          ⚖️ Weight Tracker
        </h1>

        {/* Latest weight */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div style={{ fontSize: "32px", fontWeight: "bold", color: "#333" }}>
            {latestWeight} lb
          </div>
          <div style={{ fontSize: "14px", color: "#666" }}>
            {latestDate}
          </div>
        </div>

      {/* Input */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
        <input
          placeholder="Enter weight"
          value={newWeight}
          onChange={(e) => setNewWeight(e.target.value)}
          style={{ flex: 1, padding: "10px", fontSize: "16px", borderRadius: "8px", border: "1px solid #ccc" }}
        />
        <button
          onClick={addWeight}
          style={{
            padding: "10px 16px",
            fontSize: "16px",
            backgroundColor: "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "8px"
          }}
        >
          Log
        </button>
      </div>

      {/* Chart */}
      {weightLog.length > 0 && (
        <div style={{
          backgroundColor: "#fff",
          padding: "16px",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          marginBottom: "24px"
        }}>
          <Line data={data} />
        </div>
      )}

      {/* History */}
      <ul style={{ paddingLeft: "16px" }}>
        {weightLog.map((w, i) => (
          <li key={i} style={{ fontSize: "16px", marginBottom: "6px" }}>
            {w.date}: {w.weight} lbs{" "}
            <button onClick={() => deleteWeight(i)} style={{ marginLeft: "8px" }}>❌</button>
          </li>
        ))}
    </ul>
  </div>
 {/* — Fixed Bottom Tab Bar — */}
        <div style={{
          position:     "fixed",
          bottom:       0,
          left:         0,
          right:        0,
          display:      "flex",
          height:       "56px",
          backgroundColor: "#fff",
          borderTop:    "1px solid #ddd",
          boxShadow:    "0 -1px 4px rgba(0,0,0,0.1)"
        }}>
          <button onClick={() => setScreen("food")}     style={{ flex:1,border:"none",background:"transparent",fontSize:"16px",cursor:"pointer" }}>🍽️ Food</button>
          <button onClick={() => setScreen("workouts")} style={{ flex:1,border:"none",background:"transparent",fontSize:"16px",cursor:"pointer" }}>🏋️ Workouts</button>
          <button onClick={() => setScreen("weight")}   style={{ flex:1,border:"none",background:"transparent",fontSize:"16px",cursor:"pointer" }}>⚖️ Weight</button>
        </div>
      </>
    );
  }

   return (
    <>
      <div style={{
        padding: "24px",
        paddingBottom: "80px",            // make room for the tab bar
        fontFamily: "Inter, Arial, sans-serif",
        maxWidth: "500px",
        margin: "auto"
      }}>

    {/* Overview Box */}
<div style={{
backgroundColor: "#f9f9f9",
borderRadius:    "12px",
padding:         "16px",
boxShadow:       "0 1px 4px rgba(0,0,0,0.05)",
marginBottom:    "20px"
}}>
<div style={{
  display:      "flex",
  alignItems:   "center",
  marginBottom: "8px"
}}>
  <h2 style={{
    flex:       1,
    fontSize:   "17px",
    fontWeight: "600",
    margin:     0
  }}>
    📊 Today
  </h2>

  {/* Inline Mode button */}
  <button
    onClick={() => setShowModes(!showModes)}
    style={{
      backgroundColor: "#1976d2",
      color:           "white",
      padding:         "4px 10px",
      fontSize:        "13px",
      border:          "none",
      borderRadius:    "6px",
      marginRight:     "8px"
    }}
  >
    Mode: {mode}
  </button>

  {/* Reset button */}
  <button
    onClick={resetDay}
    style={{
      backgroundColor: "#d32f2f",
      color:           "white",
      padding:         "4px 10px",
      fontSize:        "13px",
      border:          "none",
      borderRadius:    "6px"
    }}
  >
    Reset
  </button>
</div>

    {showModes && (
  <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "12px" }}>
    {["Cut","Maintenance","Bulk"].map(m => (
      <button
        key={m}
        onClick={() => { setMode(m); setShowModes(false); }}
        style={{
          padding: "4px 8px",
          border: "none",
          borderRadius: "6px",
          backgroundColor: mode === m ? "#1976d2" : "#eee",
          color: mode === m ? "white" : "#000"
        }}
      >
        {m}
      </button>
    ))}
  </div>
)}

      <div style={{ fontSize: "16px", marginBottom: "8px" }}>
  <strong>Calories Eaten:</strong>{" "}
  <span style={{ color: calories >= calorieThreshold ? "green" : "red" }}>
    {calories}
  </span>
</div>
      <div style={{ fontSize: "16px", marginBottom: "8px" }}>
        <strong>Calories Burned:</strong>{" "}
{
  Object.entries(workoutLog).reduce((sum, [type, value]) => {
  if (typeof value === "object" && value !== null && typeof value.cal === "number") {
    return sum + value.cal;
  }
  if (type === "Swim") return sum + Math.round(value * 7);
  if (type === "Plank") return sum + Math.round(value * 0.04);
  if (workouts[type]) return sum + Math.round(value * workouts[type]);
  return sum;
}, 0)
}
      </div>
{(() => {
  // Compute pass/fail per mode
  const isMet =
    mode === "Maintenance"
      ? Math.abs(estimatedDeficit) <= 100
      : mode === "Bulk"
        ? estimatedDeficit <= -100
        : estimatedDeficit >= deficitGoal;

  // Determine the label after the slash
  const thresholdLabel =
    mode === "Maintenance"
      ? "±100"
      : mode === "Bulk"
        ? "≥100"
        : deficitGoal;

  return (
    <div style={{ fontSize: "16px", marginBottom: "8px" }}>
      <strong>Deficit:</strong>{" "}
      <span style={{ color: isMet ? "green" : "red" }}>
        {estimatedDeficit}
      </span>{" "}
      / {thresholdLabel}
      {isMet && (
        <span style={{ fontSize: "12px", marginLeft: "4px" }}>✅</span>
      )}
    </div>
  );
})()}


<div style={{ fontSize: "16px", marginBottom: "8px" }}>
  <strong>Protein:</strong>{" "}
  <span style={{ color: Math.round(protein * 10) / 10 >= proteinGoal ? "green" : "red" }}>
    {Math.round(protein * 10) / 10}
  </span>
  <span> / {proteinGoal}</span>
  {Math.round(protein * 10) / 10 >= proteinGoal && (
    <span style={{ fontSize: "12px", marginLeft: "4px" }}>✅</span>
  )}
</div>

<div style={{ fontSize: "16px", marginBottom: "8px" }}>
  <strong>Fat:</strong>{" "}
  <span style={{ color: Math.round(fat * 10) / 10 >= fatGoal ? "green" : "red" }}>
    {Math.round(fat * 10) / 10}
  </span>
  <span> / {fatGoal}g</span>
  {Math.round(fat * 10) / 10 >= fatGoal && (
    <span style={{ fontSize: "12px", marginLeft: "4px" }}>✅</span>
  )}
</div>

<div style={{ fontSize: "16px", marginBottom: "8px" }}>
  <strong>Carbs:</strong>{" "}
  <span style={{ color: Math.round(carbs * 10) / 10 >= carbGoal ? "green" : "red" }}>
    {Math.round(carbs * 10) / 10}
  </span>
  <span> / {carbGoal}g</span>
  {Math.round(carbs * 10) / 10 >= carbGoal && (
    <span style={{ fontSize: "12px", marginLeft: "4px" }}>✅</span>
  )}
</div>

<div style={{ fontSize: "16px", marginBottom: "8px" }}>
  <strong>Fiber:</strong>{" "}
  <span style={{ color: Math.round(fiber * 10) / 10 >= fiberGoal ? "green" : "red" }}>
    {Math.round(fiber * 10) / 10}
  </span>
  <span> / {fiberGoal}g</span>
  {Math.round(fiber * 10) / 10 >= fiberGoal && (
    <span style={{ fontSize: "12px", marginLeft: "4px" }}>✅</span>
  )}
</div>

<div style={{ fontSize: "16px", marginBottom: "8px" }}>
  <strong>Water:</strong>{" "}
  <span style={{ color: (water + (checklist.concentrace ? 1 : 0)) >= waterGoal ? "green" : "red" }}>
    {water + (checklist.concentrace ? 1 : 0)}
  </span>
  <span> / {waterGoal} bottles</span>
  {(water + (checklist.concentrace ? 1 : 0)) >= waterGoal && (
    <span style={{ fontSize: "12px", marginLeft: "4px" }}>✅</span>
  )}
</div>

<div style={{ fontSize: "16px" }}>
  <strong>Steps:</strong>{" "}
  <span style={{ color: steps >= stepGoal ? "green" : "red" }}>
    {steps}
  </span>
  <span> / {stepGoal}</span>
  {steps >= stepGoal && (
    <span style={{ fontSize: "12px", marginLeft: "4px" }}>✅</span>
  )}
</div>

    </div>

    {/* Checklist Box */}
    <div style={{
      backgroundColor: "#f9f9f9",
      borderRadius: "12px",
      padding: "16px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      marginBottom: "12px"
    }}>
      <h3 style={{
  fontSize: "18px",
  fontWeight: "600",
  marginTop: "0px",
  marginBottom: "12px"
}}>
  {allChecklistItemsComplete ? "✅" : "☑️"} Checklist
</h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
  {["concentrace", "teffilin", "sunlight", "supplements"].map((key) => (
    <label key={key} style={{ fontSize: "16px" }}>
      <input
        type="checkbox"
        checked={checklist[key]}
        onChange={() =>
          setChecklist((prev) => ({ ...prev, [key]: !prev[key] }))
        }
        style={{ marginRight: "10px" }}
      />
      {key === "concentrace"
        ? "Concentrace 💧"
        : key === "teffilin"
        ? "Tefillin ✡️"
        : key === "sunlight"
        ? "Sunlight 🌞"
        : key === "supplements"
        ? "Supplements 💊"
        : key}
    </label>
  ))}
</div>
    </div>
    

  </div>
 {/* — Fixed Bottom Tab Bar — */}
      <div style={{
        position:     "fixed",
        bottom:       0,
        left:         0,
        right:        0,
        display:      "flex",
        height:       "56px",
        backgroundColor: "#fff",
        borderTop:    "1px solid #ddd",
        boxShadow:    "0 -1px 4px rgba(0,0,0,0.1)"
      }}>
        <button
          onClick={() => setScreen("food")}
          style={{
            flex:1,
            border:"none",
            background:"transparent",
            fontSize:"16px",
            cursor:"pointer"
          }}
        >
          🍽️ Food
        </button>
        <button
          onClick={() => setScreen("workouts")}
          style={{
            flex:1,
            border:"none",
            background:"transparent",
            fontSize:"16px",
            cursor:"pointer"
          }}
        >
          🏋️ Workouts
        </button>
        <button
          onClick={() => setScreen("weight")}
          style={{
            flex:1,
            border:"none",
            background:"transparent",
            fontSize:"16px",
            cursor:"pointer"
          }}
        >
          ⚖️ Weight
        </button>
      </div>
    </>
  );
}

export default App;
