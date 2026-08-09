// JARVIS Intelligence Engine - Comprehensive Knowledge Base
// Covers health, fitness, cooking, finance, relationships, tech, home, career, and much more

const JARVIS_PREFIX = [
  "Sir,",
  "Certainly, Sir.",
  "Of course, Sir.",
  "Right away, Sir.",
  "Very well, Sir.",
  "Indeed, Sir.",
  "Absolutely, Sir.",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function prefix(): string {
  return pick(JARVIS_PREFIX);
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning, Sir.";
  if (h < 17) return "Good afternoon, Sir.";
  return "Good evening, Sir.";
}

// ─── Weather via Open-Meteo ───────────────────────────────────────────
const WEATHER_CODES: Record<number, string> = {
  0: "clear skies", 1: "mainly clear", 2: "partly cloudy", 3: "overcast",
  45: "foggy", 48: "depositing rime fog", 51: "light drizzle", 53: "moderate drizzle",
  55: "dense drizzle", 61: "slight rain", 63: "moderate rain", 65: "heavy rain",
  71: "slight snow", 73: "moderate snow", 75: "heavy snow", 80: "rain showers",
  81: "moderate rain showers", 82: "violent rain showers", 95: "thunderstorms",
  96: "thunderstorms with hail", 99: "thunderstorms with heavy hail",
};

async function getWeather(query: string): Promise<string | null> {
  try {
    const cityMatch = query.match(/weather\s+(?:in|for|at)\s+(.+?)(?:\?|$|today|tomorrow)/i);
    const city = cityMatch ? cityMatch[1].trim() : query.replace(/weather|what's|what is|the|how's|how is|outside|\?/gi, "").trim();
    if (!city || city.length < 2) return await fetchWeather("New York", 40.71, -74.01);
    const geoRes = await fetchWithTimeout(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en`, {}, 8000);
    if (!geoRes.ok) return null;
    const geoData = await geoRes.json();
    if (!geoData.results?.length) return `I couldn't locate "${city}" in my geographical database, Sir.`;
    const loc = geoData.results[0];
    return await fetchWeather(loc.name + (loc.country ? `, ${loc.country}` : ""), loc.latitude, loc.longitude);
  } catch { return null; }
}

async function fetchWeather(cityName: string, lat: number, lon: number): Promise<string> {
  const res = await fetchWithTimeout(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=3`, {}, 8000);
  const data = await res.json();
  const cw = data.current_weather;
  const tempF = Math.round(cw.temperature * 9 / 5 + 32);
  const condition = WEATHER_CODES[cw.weathercode] || "varied conditions";
  const windMph = Math.round(cw.windspeed * 0.621);
  let forecast = "";
  if (data.daily?.temperature_2m_max?.[1]) {
    forecast = `\n\nTomorrow: ${Math.round(data.daily.temperature_2m_min[1] * 9/5 + 32)}°F to ${Math.round(data.daily.temperature_2m_max[1] * 9/5 + 32)}°F.`;
  }
  let advice = "";
  if (tempF > 90) advice = " Stay hydrated, Sir.";
  else if (tempF < 32) advice = " Bundle up warmly.";
  else if (cw.weathercode >= 61) advice = " Umbrella recommended.";
  return `Current weather in ${cityName}: ${tempF}°F (${cw.temperature}°C) with ${condition}. Wind: ${windMph} mph.${advice}${forecast}`;
}

// ─── Comprehensive Knowledge Base ──────────────────────────────────────
interface KnowledgeEntry {
  patterns: RegExp[];
  responses: string[];
}

const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  // ═══════════════════════════════════════════════════════════════════════
  // HEALTH & WELLNESS
  // ═══════════════════════════════════════════════════════════════════════
  {
    patterns: [/healthy\s+breakfast/i, /breakfast.*health/i, /what.*eat.*morning/i, /good\s+breakfast/i, /best\s+breakfast/i],
    responses: [`${prefix()} A solid healthy breakfast should include:\n\n• **Protein**: eggs, Greek yogurt, cottage cheese, or protein smoothie\n• **Complex carbs**: oatmeal, whole grain toast, or sweet potato\n• **Healthy fats**: avocado, nuts, nut butter, or chia seeds\n• **Fiber**: berries, banana, apple, or leafy greens\n\nQuick options:\n1. Overnight oats with berries and nuts\n2. Avocado toast with eggs\n3. Greek yogurt parfait with granola\n4. Smoothie with spinach, banana, protein powder\n\nAvoid: sugary cereals, pastries, and fruit juices (whole fruit is better). Aim to eat within 1-2 hours of waking.`],
  },
  {
    patterns: [/healthy\s+lunch/i, /lunch.*health/i, /what.*eat.*lunch/i, /good\s+lunch/i],
    responses: [`Nutritious lunch options, Sir:\n\n**Quick & Healthy:**\n• Grilled chicken salad with olive oil dressing\n• Quinoa bowl with roasted vegetables\n• Turkey and avocado wrap (whole wheat)\n• Lentil soup with whole grain bread\n• Tuna salad (light mayo) on greens\n\n**Meal Prep Ideas:**\n• Buddha bowls (grain + protein + veggies + sauce)\n• Mason jar salads (dressing on bottom)\n• Chicken stir-fry portions\n\n**Guidelines:**\n• 400-600 calories ideal\n• Include protein to avoid afternoon crash\n• Vegetables should fill half your plate\n• Eat mindfully, not at your desk if possible`],
  },
  {
    patterns: [/healthy\s+dinner/i, /dinner.*health/i, /what.*eat.*dinner|evening/i, /light\s+dinner/i],
    responses: [`For dinner, Sir, lighter yet satisfying options:\n\n**Protein + Vegetables:**\n• Grilled salmon with roasted asparagus\n• Baked chicken breast with steamed broccoli\n• Lean steak with mixed vegetables\n• Shrimp stir-fry with bok choy\n\n**Plant-Based:**\n• Black bean tacos with cabbage slaw\n• Chickpea curry with cauliflower rice\n• Stuffed bell peppers with quinoa\n\n**Tips:**\n• Eat 2-3 hours before bed for better sleep\n• Portion: palm-sized protein, fist-sized carbs, unlimited vegetables\n• Avoid heavy sauces; use herbs and spices\n• Hydrate with water, not calories`],
  },
  {
    patterns: [/healthy\s+snack/i, /snack.*health/i, /what.*snack/i, /good\s+snack/i, /afternoon\s+snack/i],
    responses: [`Healthy snack options, Sir:\n\n**Under 200 calories:**\n• Apple with 1 tbsp almond butter\n• Greek yogurt (plain) with berries\n• Handful of mixed nuts (about 1 oz)\n• Hummus with carrot/celery sticks\n• Hard-boiled eggs (2)\n• Cheese stick with grapes\n• Edamame (1 cup)\n• Rice cake with avocado\n\n**Protein-focused (for satiety):**\n• Cottage cheese with cucumber\n• Turkey roll-ups with mustard\n• Protein shake\n\n**Avoid:** chips, cookies, candy, sugary granola bars. These spike blood sugar then crash, leaving you hungrier.`],
  },
  {
    patterns: [/lose\s+weight/i, /weight\s+loss/i, /how.*slim/i, /diet\s+tip/i, /burn\s+fat/i, /shed\s+pounds/i, /cut\s+weight/i],
    responses: [`Weight management fundamentals, Sir:\n\n**The Science:**\n• Caloric deficit is required — burn more than you consume\n• 500 cal/day deficit ≈ 1 lb/week loss (sustainable)\n• Track calories initially to build awareness\n\n**Practical Steps:**\n1. **Protein first** — 0.8-1g per lb of body weight; keeps you full\n2. **Fiber up** — vegetables, whole grains, legumes\n3. **Hydrate** — often thirst mimics hunger\n4. **Sleep 7-9 hours** — poor sleep spikes hunger hormones\n5. **Move daily** — 10,000 steps + 3x strength training\n6. **Reduce processed foods** — they're engineered to overeat\n\n**Mindset:**\n• Progress over perfection\n• Small sustainable changes beat dramatic unsustainable ones\n• Weight fluctuates daily — track weekly trends`],
  },
  {
    patterns: [/gain\s+weight/i, /build\s+muscle/i, /bulk/i, /get\s+bigger/i, /gain\s+muscle/i, /put\s+on\s+weight/i],
    responses: [`Muscle building protocol, Sir:\n\n**Nutrition:**\n• Caloric surplus: +300-500 calories above maintenance\n• Protein: 1-1.2g per lb of body weight\n• Eat every 3-4 hours (4-6 meals)\n• Post-workout: protein + carbs within 2 hours\n\n**Training:**\n• Lift heavy (progressive overload is key)\n• Compound movements: squat, deadlift, bench, rows, overhead press\n• 3-5 sets of 6-12 reps per exercise\n• Train each muscle group 2x/week\n• Rest 48-72 hours between same muscle groups\n\n**Recovery:**\n• Sleep 7-9 hours (growth hormone peaks during sleep)\n• Manage stress (cortisol inhibits muscle growth)\n• Stay hydrated\n\nExpect: 0.5-1 lb of muscle per month with proper training.`],
  },
  {
    patterns: [/drink.*water|water.*drink/i, /how\s+much\s+water/i, /hydrat/i, /dehydrat/i],
    responses: [`Hydration guidelines, Sir:\n\n**Daily Intake:**\n• General: 8 cups (64 oz / 2L) minimum\n• Active: 12-16 cups\n• Hot climate: add 2-4 cups\n• Formula: body weight (lbs) ÷ 2 = oz per day\n\n**Signs of Dehydration:**\n• Dark yellow urine (aim for pale yellow)\n• Headache, fatigue, dizziness\n• Dry mouth and skin\n• Reduced concentration\n\n**Tips:**\n• Drink a glass upon waking\n• Carry a water bottle always\n• Drink before you feel thirsty\n• Herbal tea counts; coffee is mild diuretic\n• Eat water-rich foods (cucumber, watermelon, oranges)\n\n**During exercise:** 7-10 oz every 10-20 minutes.`],
  },
  {
    patterns: [/can'?t\s+sleep|cannot\s+sleep|insomnia|sleep\s+better|trouble\s+sleeping|how.*sleep|sleep.*help|help.*sleep|not\s+sleeping|poor\s+sleep|sleep\s+problem|hard\s+to\s+sleep|fall\s+asleep/i],
    responses: [`Sleep optimization protocol, Sir:\n\n**Environment:**\n• Cool room: 65-68°F (18-20°C)\n• Complete darkness (blackout curtains or mask)\n• White noise if needed\n• Reserve bed for sleep only\n\n**Pre-Sleep Routine (1-2 hours before):**\n• No screens (blue light blocks melatonin)\n• Dim lights throughout home\n• Avoid caffeine after 2 PM\n• No alcohol within 3 hours (disrupts REM)\n• Light reading or meditation\n\n**Habits:**\n• Same bedtime/wake time daily (even weekends)\n• No naps after 3 PM\n• Exercise, but not within 3 hours of bed\n• Avoid large meals before bed\n\n**If you can't sleep:**\n• Get up after 20 minutes, do something calm\n• Don't watch the clock\n• Try 4-7-8 breathing: inhale 4s, hold 7s, exhale 8s`],
  },
  {
    patterns: [/headache|head\s*ache|migraine/i],
    responses: [`Headache relief, Sir:\n\n**Immediate Actions:**\n1. Hydrate — drink 16 oz of water now\n2. Dim lights, reduce screen brightness\n3. Apply cold compress to forehead/temples\n4. Rest in quiet, dark room\n5. OTC pain relief (ibuprofen or acetaminophen)\n\n**Common Causes:**\n• Dehydration (most common)\n• Eye strain (screens, reading)\n• Tension (neck/shoulder tightness)\n• Skipped meals (blood sugar drop)\n• Poor sleep\n• Caffeine withdrawal\n\n**Prevention:**\n• Regular hydration\n• 20-20-20 rule for screens\n• Proper posture\n• Regular sleep schedule\n• Limit alcohol\n\n**Seek medical attention if:** sudden severe headache, fever, vision changes, confusion, or neck stiffness.`],
  },
  {
    patterns: [/stressed|stress|anxiety|anxious|overwhelmed|calm\s+down|panic|worried|worrying/i],
    responses: [`Stress management protocol, Sir:\n\n**Immediate Relief (do now):**\n1. 4-7-8 breathing: inhale 4s, hold 7s, exhale 8s (4 cycles)\n2. Ground yourself: name 5 things you see, 4 hear, 3 touch, 2 smell, 1 taste\n3. Progressive muscle relaxation: tense then release each muscle group\n\n**Short-Term:**\n• Physical activity — even 10 min walk helps\n• Reduce caffeine and sugar\n• Limit news and social media\n• Talk to someone trusted\n• Write down your worries (gets them out of your head)\n\n**Long-Term:**\n• Regular exercise\n• Adequate sleep\n• Meditation/mindfulness practice\n• Set boundaries\n• Identify and address root causes\n\n**Remember:** You cannot pour from an empty cup. Self-care is essential, not indulgent.`],
  },
  {
    patterns: [/cold|flu|sick|runny\s+nose|sore\s+throat|fever|cough/i],
    responses: [`Cold and flu recovery, Sir:\n\n**Rest & Hydrate:**\n• Sleep as much as possible\n• Water, herbal tea, broth — stay well hydrated\n• Warm liquids soothe throat and loosen congestion\n\n**Symptom Relief:**\n• Sore throat: warm salt water gargle, honey tea\n• Congestion: steam inhalation, saline spray, humidifier\n• Fever: acetaminophen or ibuprofen (follow dosing)\n• Cough: honey (not for children under 1)\n\n**Support Recovery:**\n• Vitamin C, zinc, elderberry (may shorten duration)\n• Chicken soup — actually has anti-inflammatory properties\n• Avoid dairy if congested (thickens mucus)\n\n**When to See Doctor:**\n• Fever above 103°F (39.4°C)\n• Symptoms lasting more than 10 days\n• Difficulty breathing\n• Severe headache or neck stiffness`],
  },
  {
    patterns: [/back\s+pain|backache|lower\s+back|spine|posture/i],
    responses: [`Back pain management, Sir:\n\n**Immediate Relief:**\n• Apply ice for first 48 hours, then heat\n• Gentle stretching (cat-cow, knee-to-chest)\n• OTC anti-inflammatory (ibuprofen)\n• Avoid prolonged sitting or standing\n\n**Prevention:**\n• Strengthen core muscles\n• Maintain healthy weight\n• Proper lifting: bend knees, not back\n• Ergonomic workspace setup\n• Regular movement breaks every 30-60 min\n\n**Posture Check:**\n• Ears over shoulders\n• Shoulders over hips\n• Screen at eye level\n• Feet flat on floor\n• Use lumbar support\n\n**Exercises:**\n• Planks, bird-dogs, dead bugs\n• Glute bridges\n• Hip flexor stretches\n\n**See a doctor if:** numbness, weakness, bowel/bladder changes, or pain after injury.`],
  },
  {
    patterns: [/hangover|drank\s+too\s+much|after\s+drinking/i],
    responses: [`Hangover recovery, Sir:\n\n**Hydration (priority):**\n• Water with electrolytes (sports drink, coconut water)\n• Avoid coffee initially (more dehydrating)\n\n**Food:**\n• Bland carbs: toast, crackers, banana\n• Eggs (contain cysteine which helps process alcohol)\n• Broth or soup for electrolytes\n• Avoid greasy foods (harder to digest)\n\n**Rest:**\n• Sleep if possible — body recovers during rest\n• Avoid strenuous activity\n\n**Symptom Relief:**\n• Headache: ibuprofen (avoid acetaminophen — hard on liver after alcohol)\n• Nausea: ginger tea or ginger candies\n\n**Prevention for next time:**\n• Alternate alcohol with water\n• Eat before/during drinking\n• Avoid dark liquors (more congeners)\n• Set a drink limit beforehand\n\nTime is the only true cure, Sir. The body needs 24-72 hours to fully recover.`],
  },
  {
    patterns: [/lose\s+belly|belly\s+fat|stomach\s+fat|flat\s+stomach|abs|six\s+pack/i],
    responses: [`Reducing belly fat, Sir:\n\n**Truth:** You cannot spot-reduce fat. Overall body fat must decrease.\n\n**Nutrition (80% of results):**\n• Caloric deficit (300-500 cal/day)\n• Cut refined carbs and sugar\n• Increase protein and fiber\n• Limit alcohol (especially beer — "beer belly" is real)\n• Avoid trans fats\n\n**Exercise:**\n• Cardio: HIIT is most effective for fat loss\n• Strength training: builds muscle, raises metabolism\n• Core work: planks, dead bugs, hanging leg raises\n\n**Lifestyle:**\n• Sleep 7-9 hours (cortisol from poor sleep stores belly fat)\n• Manage stress (cortisol again)\n• Stay consistent — takes 8-12 weeks to see results\n\n**For visible abs:** typically requires <15% body fat for men, <20% for women.`],
  },
  {
    patterns: [/vitamins?|supplements?|should\s+i\s+take|what\s+supplements/i],
    responses: [`Supplement guidance, Sir:\n\n**Generally Beneficial:**\n• **Vitamin D**: especially if limited sun exposure (1000-4000 IU)\n• **Omega-3s**: if you don't eat fatty fish 2x/week\n• **Magnesium**: most people are deficient; helps sleep, muscles\n\n**Situational:**\n• B12: essential for vegans/vegetarians\n• Iron: only if deficient (test first — excess is harmful)\n• Protein powder: convenient if struggling to hit protein goals\n• Creatine: proven for muscle and cognitive benefits\n\n**Often Unnecessary:**\n• Multivitamins (if diet is balanced)\n• Most "detox" supplements\n• Testosterone boosters\n\n**Key Principle:** Supplements supplement — they don't replace good nutrition. Food first, pills second.\n\nConsider blood work to identify actual deficiencies before supplementing.`],
  },
  {
    patterns: [/alcohol|drinking|how\s+much.*drink|safe.*drink/i],
    responses: [`Alcohol guidelines, Sir:\n\n**"Moderate" Drinking:**\n• Men: up to 2 drinks/day\n• Women: up to 1 drink/day\n• (1 drink = 12oz beer, 5oz wine, 1.5oz spirits)\n\n**Health Effects:**\n• Liver damage (chronic heavy use)\n• Disrupted sleep (reduces REM)\n• Empty calories (7 cal/gram)\n• Dehydration\n• Impaired judgment and coordination\n\n**Healthier Choices:**\n• Red wine (in moderation, has some antioxidants)\n• Clear spirits with soda water\n• Avoid sugary mixers\n\n**Tips:**\n• Eat before/during drinking\n• Alternate alcohol with water\n• Set a limit before going out\n• Never drink and drive\n\n**No amount is "healthy"** — recent research suggests even moderate drinking has risks. The safest amount is zero.`],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // FITNESS & EXERCISE
  // ═══════════════════════════════════════════════════════════════════════
  {
    patterns: [/exercise|workout|gym|fitness|stay\s+fit|get\s+fit|start\s+working\s+out/i],
    responses: [`Fitness framework, Sir:\n\n**Weekly Targets:**\n• Cardio: 150 min moderate OR 75 min vigorous\n• Strength: 2-3 sessions (all major muscle groups)\n• Flexibility: 2-3 sessions (stretching/yoga)\n• Rest: 1-2 full rest days\n\n**For Beginners:**\nWeek 1-4: 3 days/week, 30 min each\n• Day 1: Walk/jog + upper body\n• Day 2: Rest or light stretching\n• Day 3: Walk/jog + lower body\n• Day 4: Rest\n• Day 5: Full body + cardio\n\n**Key Exercises:**\n• Squats, lunges (legs)\n• Push-ups, rows (upper body)\n• Planks, dead bugs (core)\n• Walking, cycling, swimming (cardio)\n\n**Tips:**\n• Start light, progress gradually\n• Form over weight\n• Consistency beats intensity\n• Track workouts\n• Warm up and cool down`],
  },
  {
    patterns: [/run|running|jogging|5k|marathon|cardio\s+tips/i],
    responses: [`Running guidance, Sir:\n\n**For Beginners:**\n• Start with walk/run intervals\n• Week 1: Run 1 min, walk 2 min (repeat 10x)\n• Gradually increase run time, decrease walk\n• 3 runs/week with rest days between\n\n**5K Training (8 weeks):**\n• Run 3-4x/week\n• One long run (add 0.5 mile/week)\n• Include easy days and one tempo run\n\n**Form:**\n• Land midfoot, not heel\n• Short, quick strides\n• Relaxed shoulders, arms at 90°\n• Look ahead, not down\n\n**Injury Prevention:**\n• Don't increase mileage >10%/week\n• Proper running shoes (get fitted)\n• Warm up and cool down\n• Strength train (especially glutes, core)\n\n**Breathing:** 3:2 ratio (inhale 3 steps, exhale 2) for easy pace.`],
  },
  {
    patterns: [/stretch|flexibility|tight\s+muscles|yoga|limber/i],
    responses: [`Stretching protocol, Sir:\n\n**Daily Stretch Routine (10 min):**\n1. Neck rolls (30 sec each direction)\n2. Shoulder circles (30 sec)\n3. Cat-cow (10 reps)\n4. Hip flexor stretch (30 sec each leg)\n5. Hamstring stretch (30 sec each leg)\n6. Pigeon pose (30 sec each side)\n7. Child's pose (1 min)\n\n**Guidelines:**\n• Dynamic stretching before exercise\n• Static stretching after exercise\n• Hold stretches 30-60 seconds\n• Never stretch to pain — mild tension only\n• Breathe deeply, don't hold breath\n\n**Benefits:**\n• Improved range of motion\n• Reduced injury risk\n• Better posture\n• Decreased muscle tension\n• Stress relief\n\n**Yoga:** Excellent for flexibility + strength + mindfulness. Start with beginner classes.`],
  },
  {
    patterns: [/sore\s+muscles|muscle\s+pain|doms|recovery|after\s+workout/i],
    responses: [`Muscle recovery, Sir:\n\n**DOMS (Delayed Onset Muscle Soreness):**\n• Normal 24-72 hours after new/intense exercise\n• Peaks around 48 hours\n• Not necessarily indicator of good workout\n\n**Recovery Strategies:**\n• Light movement (active recovery)\n• Foam rolling\n• Adequate protein (repairs muscle)\n• Sleep 7-9 hours\n• Hydration\n• Contrast showers (hot/cold)\n\n**What Helps:**\n• Gentle stretching\n• Massage\n• Epsom salt bath\n• Anti-inflammatory foods (berries, fish, turmeric)\n\n**What Doesn't Help Much:**\n• Static stretching (doesn't prevent DOMS)\n• NSAIDs may slow adaptation\n\n**When to Worry:**\n• Sharp, sudden pain (possible injury)\n• Extreme swelling\n• Dark urine (possible rhabdomyolysis — see doctor immediately)`],
  },
  {
    patterns: [/home\s+workout|no\s+gym|workout.*home|exercise.*home|no\s+equipment/i],
    responses: [`Home workout routine, Sir:\n\n**No Equipment Full Body (30 min):**\n\n*Warm-up (5 min):* Jumping jacks, high knees, arm circles\n\n*Circuit (3 rounds):*\n• 15 Push-ups (or knee push-ups)\n• 20 Squats\n• 10 Lunges each leg\n• 30-sec Plank\n• 15 Glute bridges\n• 10 Superman holds\n• 15 Tricep dips (using chair)\n• Rest 60 sec between rounds\n\n*Cool-down (5 min):* Stretching\n\n**Equipment Worth Buying:**\n• Resistance bands (~$15)\n• Pull-up bar (~$25)\n• Adjustable dumbbells ($100+)\n• Yoga mat (~$20)\n\n**Progressions:**\n• Push-ups: incline → regular → decline → diamond\n• Squats: bodyweight → pause → jump → single leg\n• Plank: 30s → 60s → 90s → side planks`],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // MENTAL HEALTH & MINDFULNESS
  // ═══════════════════════════════════════════════════════════════════════
  {
    patterns: [/meditat|mindful|calm|relax|breathing\s+exercise|peace|center\s+myself/i],
    responses: [`Mindfulness protocol, Sir:\n\n**4-7-8 Breathing (instant calm):**\n1. Inhale through nose: 4 seconds\n2. Hold: 7 seconds\n3. Exhale through mouth: 8 seconds\n4. Repeat 4 cycles\n\n**5-Minute Meditation:**\n1. Sit comfortably, close eyes\n2. Focus on breath — in and out\n3. When mind wanders, gently return to breath\n4. No judgment — wandering IS the practice\n\n**Body Scan (10 min):**\n• Start at toes, move up to head\n• Notice sensations without changing\n• Breathe into areas of tension\n\n**Apps:** Headspace, Calm, Insight Timer\n\n**Benefits (proven by research):**\n• Reduced stress and anxiety\n• Improved focus and concentration\n• Better emotional regulation\n• Lower blood pressure\n• Enhanced sleep quality\n\nEven 10 minutes daily creates lasting change.`],
  },
  {
    patterns: [/motivat|unmotivated|no\s+motivation|feeling\s+lazy|procrastinat|can'?t\s+start/i],
    responses: [`Motivation strategies, Sir:\n\n**The Truth:** Motivation follows action, not the other way around.\n\n**Start Small:**\n• 2-minute rule: commit to just 2 minutes\n• Usually, starting is the hardest part\n• Momentum builds naturally\n\n**Environment Design:**\n• Remove friction (prepare the night before)\n• Make desired behavior obvious\n• Remove temptations\n\n**Mental Techniques:**\n• Visualize completion, not just goals\n• "If I don't do this, my future self suffers"\n• Accountability partner\n• Track streaks (don't break the chain)\n\n**Energy Management:**\n• Hard tasks in your peak energy time\n• Adequate sleep\n• Regular exercise (increases energy)\n• Proper nutrition\n\n**Remember:** Discipline > motivation. You don't need to feel like it. Do it anyway.`],
  },
  {
    patterns: [/depress|sad|down|unhappy|feeling\s+low|feel\s+empty|hopeless/i],
    responses: [`I hear you, Sir. Here are some strategies:\n\n**Immediate Actions:**\n• Get outside — sunlight helps mood\n• Move your body — even a short walk\n• Connect with someone (call a friend/family)\n• Avoid alcohol (it's a depressant)\n\n**Daily Habits:**\n• Wake at the same time daily\n• Exercise regularly\n• Eat nutritious food\n• Limit social media\n• Practice gratitude (3 good things daily)\n\n**Longer Term:**\n• Therapy (CBT is highly effective)\n• Build social connections\n• Pursue meaningful activities\n• Consider medication (talk to doctor)\n\n**Please Seek Help If:**\n• Persistent symptoms >2 weeks\n• Thoughts of self-harm\n• Unable to function in daily life\n\n**Resources:**\n• National Suicide Prevention Lifeline: 988\n• Crisis Text Line: Text HOME to 741741\n\nYou don't have to face this alone, Sir.`],
  },
  {
    patterns: [/self\s*care|take\s+care.*myself|me\s+time|recharge|burnout/i],
    responses: [`Self-care protocol, Sir:\n\n**Physical:**\n• Sleep 7-9 hours\n• Nourishing food (not junk comfort food)\n• Exercise or movement\n• Hygiene and grooming\n• Health check-ups\n\n**Mental:**\n• Set boundaries (say no)\n• Reduce screen time\n• Mindfulness/meditation\n• Journaling\n• Therapy when needed\n\n**Emotional:**\n• Express feelings (don't suppress)\n• Connect with loved ones\n• Forgive yourself\n• Celebrate small wins\n\n**Practical:**\n• Organize your space\n• Plan enjoyable activities\n• Take breaks during work\n• Unplug regularly\n\n**Signs You Need Self-Care:**\n• Exhaustion\n• Irritability\n• Difficulty concentrating\n• Neglecting responsibilities\n• Withdrawal from others\n\nSelf-care isn't selfish — it's essential for functioning, Sir.`],
  },
  {
    patterns: [/confident|confidence|self\s*esteem|believe\s+in\s+myself|insecure/i],
    responses: [`Building confidence, Sir:\n\n**Mindset:**\n• Confidence is a skill, not a trait — it can be built\n• Action creates confidence, not the reverse\n• Compare yourself only to past you\n\n**Actions:**\n• Set small goals and achieve them (builds evidence)\n• Face fears gradually (exposure therapy works)\n• Improve skills through practice\n• Exercise (powerful confidence builder)\n• Good posture (affects how you feel)\n\n**Self-Talk:**\n• Replace "I can't" with "I'm learning"\n• Acknowledge achievements\n• Stop negative thought spirals\n• Visualize success before challenges\n\n**Social:**\n• Fake it initially if needed (body language)\n• Eye contact\n• Speak clearly and slowly\n• Remember: everyone is focused on themselves\n\n**Daily Practice:**\n• Write 3 things you did well each day\n• Step outside comfort zone once daily`],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // PRODUCTIVITY & TIME MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════
  {
    patterns: [/productive|productivity|focus|concentrate|get\s+things\s+done|efficient/i],
    responses: [`Productivity optimization, Sir:\n\n**Techniques:**\n• **Pomodoro**: 25 min work, 5 min break\n• **Time blocking**: schedule specific tasks\n• **2-minute rule**: if <2 min, do it now\n• **Eat the frog**: hardest task first\n\n**Environment:**\n• Eliminate distractions (phone away)\n• Clean workspace\n• Background music/white noise if helpful\n• Do Not Disturb mode\n\n**Planning:**\n• Plan tomorrow tonight\n• Top 3 priorities daily (MITs)\n• Weekly review\n• Say no to non-essentials\n\n**Energy Management:**\n• Match tasks to energy levels\n• Hard tasks during peak hours\n• Rest intentionally (not scrolling)\n\n**Mindset:**\n• Single-task (multitasking reduces efficiency 40%)\n• Done is better than perfect\n• Progress over perfection`],
  },
  {
    patterns: [/morning\s+routine|wake\s+up|how.*start.*day|morning\s+person/i],
    responses: [`Optimal morning routine, Sir:\n\n**The Night Before:**\n• Set out clothes\n• Prepare breakfast items\n• Write tomorrow's top 3 priorities\n• Set alarm across room (forces getting up)\n\n**First Hour:**\n1. Wake at consistent time (no snooze)\n2. Hydrate (16 oz water immediately)\n3. Expose to sunlight (resets circadian rhythm)\n4. Move (10 min stretching, walk, or exercise)\n5. Eat protein-rich breakfast\n6. Review daily priorities\n\n**Avoid:**\n• Phone for first 30-60 minutes\n• Email before completing priority task\n• Decision fatigue (automate choices)\n• Hitting snooze (fragments sleep)\n\n**Advanced:**\n• Cold shower (increases alertness)\n• Journaling/gratitude\n• Meditation\n\nThe first hour sets the trajectory for the entire day.`],
  },
  {
    patterns: [/time\s+manage|manage.*time|not\s+enough\s+time|too\s+busy|overwhelmed.*tasks/i],
    responses: [`Time management mastery, Sir:\n\n**The Truth:** You don't lack time — you lack priorities.\n\n**Audit Your Time:**\n• Track how you spend time for 3 days\n• Identify time wasters\n• Eliminate or delegate\n\n**Prioritization:**\n• Eisenhower Matrix:\n  - Urgent+Important: Do now\n  - Important, Not Urgent: Schedule\n  - Urgent, Not Important: Delegate\n  - Neither: Eliminate\n\n**Systems:**\n• Time block your calendar\n• Batch similar tasks\n• Set deadlines (even artificial ones)\n• Use waiting time productively\n\n**Boundaries:**\n• Learn to say no\n• Don't check email constantly\n• Protect deep work time\n• Schedule buffer time\n\n**Remember:** Busy ≠ productive. Protect time for what matters most.`],
  },
  {
    patterns: [/goal|goals|set.*goal|achieve.*goal|new\s+year.*resolution/i],
    responses: [`Goal-setting framework, Sir:\n\n**SMART Goals:**\n• Specific: What exactly?\n• Measurable: How will you track?\n• Achievable: Is it realistic?\n• Relevant: Does it align with your life?\n• Time-bound: By when?\n\n**Process Goals > Outcome Goals:**\n• Bad: "Lose 20 pounds"\n• Better: "Exercise 4x/week, cook at home 5x/week"\n\n**Implementation:**\n1. Write goals down (increases success 42%)\n2. Break into quarterly, monthly, weekly\n3. Identify lead measures (daily actions)\n4. Track progress visibly\n5. Review weekly\n\n**Mindset:**\n• Focus on systems, not just goals\n• Expect setbacks — plan for them\n• Celebrate progress, not just completion\n• One goal at a time (focus)\n\n**Why Goals Fail:**\n• Too vague\n• Too many at once\n• No tracking system\n• No accountability`],
  },
  {
    patterns: [/organiz|declutter|minimalis|clean.*space|tidy|mess/i],
    responses: [`Organization protocol, Sir:\n\n**Decluttering (Marie Kondo method):**\n1. Declutter by category, not room\n2. Hold each item: "Does this spark joy?"\n3. Keep, donate, trash\n4. Everything has a home\n\n**Daily Habits:**\n• 2-minute rule: if quick, do it now\n• One in, one out (buy something, remove something)\n• Clean as you go (especially kitchen)\n• 10-minute nightly tidy\n\n**Digital:**\n• Inbox zero (or inbox few)\n• Unsubscribe ruthlessly\n• Organize files with clear naming\n• Desktop: minimal icons\n\n**Systems:**\n• Landing zone for keys, wallet, phone\n• Weekly planning session\n• Bill pay automation\n• Meal planning\n\n**Benefits:**\n• Reduced stress\n• Saved time\n• Better focus\n• Less decision fatigue\n\nClutter is delayed decisions, Sir.`],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // COOKING & FOOD
  // ═══════════════════════════════════════════════════════════════════════
  {
    patterns: [/what.*cook|dinner\s+idea|meal\s+idea|quick\s+meal|easy\s+recipe|simple\s+recipe|what.*make.*eat/i],
    responses: [`Meal ideas, Sir:\n\n**15-Minute Meals:**\n• Pasta aglio e olio (garlic, olive oil, chili)\n• Stir-fry (any protein + veggies + soy sauce)\n• Quesadillas with whatever's in the fridge\n• Omelets or scrambled eggs with toast\n\n**30-Minute Meals:**\n• Sheet pan chicken with roasted vegetables\n• Salmon with lemon butter and steamed broccoli\n• Fried rice with eggs and vegetables\n• Tacos with seasoned ground meat\n• Pasta with jarred sauce + added vegetables\n\n**One-Pot Wonders:**\n• Chili\n• Curry\n• Soup/stew\n• Risotto\n\n**Pantry Staples to Always Have:**\n• Pasta, rice, beans\n• Canned tomatoes\n• Olive oil, garlic, onions\n• Eggs\n• Frozen vegetables\n• Soy sauce, hot sauce`],
  },
  {
    patterns: [/meal\s+prep|prep\s+meals|cook.*week|batch\s+cook/i],
    responses: [`Meal prep guide, Sir:\n\n**Sunday Prep (2 hours):**\n1. Cook 2-3 proteins (chicken, fish, eggs)\n2. Prepare 2 grains (rice, quinoa)\n3. Roast vegetables (sheet pan)\n4. Wash and chop raw veggies\n5. Portion into containers\n\n**Mix & Match Formula:**\nBase + Protein + Vegetables + Sauce\n\n**Ideas:**\n• Grain bowls\n• Salads in jars (dressing on bottom)\n• Burrito filling\n• Stir-fry components\n\n**Tips:**\n• Invest in good containers\n• Label with dates\n• Most meals last 4-5 days refrigerated\n• Freeze extras in portions\n• Prep ingredients, not just full meals\n\n**Time Savers:**\n• Pre-cut vegetables\n• Rotisserie chicken\n• Canned beans\n• Frozen rice\n• Bagged salad greens`],
  },
  {
    patterns: [/cooking\s+tip|how.*cook|culinary|chef|kitchen\s+tip|better.*cook/i],
    responses: [`Cooking fundamentals, Sir:\n\n**Essential Techniques:**\n• Salt in layers (season at every stage)\n• Let meat rest after cooking (5-10 min)\n• Taste as you go\n• Hot pan, cold oil (prevents sticking)\n• Don't overcrowd the pan\n\n**Flavor Boosters:**\n• Acid (lemon, vinegar) brightens dishes\n• Fish sauce/soy adds umami\n• Fresh herbs at the end\n• Toast spices before using\n• Caramelize onions slowly (game changer)\n\n**Knife Skills:**\n• Sharp knife = safer knife\n• Claw grip for safety\n• Cut uniform sizes for even cooking\n\n**Temperature:**\n• Meat thermometer is essential\n• Chicken: 165°F, Beef: 135°F (medium)\n• Bring meat to room temp before cooking\n\n**Mistakes to Avoid:**\n• Not reading full recipe first\n• Not prepping ingredients before starting\n• Using wet cutting board\n• Cooking cold meat in hot pan`],
  },
  {
    patterns: [/food\s+storage|how\s+long.*fridge|leftover|food\s+safe|expir/i],
    responses: [`Food storage guidelines, Sir:\n\n**Refrigerator (35-40°F):**\n• Cooked meat/poultry: 3-4 days\n• Cooked fish: 2-3 days\n• Hard-boiled eggs: 1 week\n• Leftovers: 3-4 days\n• Opened condiments: see label\n• Fresh meat (raw): 2-3 days\n\n**Freezer (0°F):**\n• Cooked meat: 2-3 months\n• Raw meat: 4-12 months\n• Bread: 3 months\n• Soups/stews: 2-3 months\n\n**Pantry:**\n• Canned goods: 2-5 years (if undented)\n• Dried pasta: 1-2 years\n• Rice: 4-5 years\n• Spices: 1-4 years (ground lose potency faster)\n\n**Safety Rules:**\n• 2-hour rule: refrigerate within 2 hours\n• When in doubt, throw it out\n• Never refreeze thawed raw meat\n• Reheat to 165°F\n\n**"Best by" vs "Use by":** Best by = quality; Use by = safety (dairy, meat).`],
  },
  {
    patterns: [/coffee|caffeine|how.*make\s+coffee|brew|espresso/i],
    responses: [`Coffee expertise, Sir:\n\n**Consumption Guidelines:**\n• Safe: up to 400mg/day (~4 cups brewed)\n• Best times: 9:30-11:30 AM, 1:30-5:00 PM (cortisol dips)\n• Avoid after 2-3 PM if affects sleep\n• Black coffee: nearly zero calories\n\n**Better Brewing:**\n• Fresh beans (within 2 weeks of roast)\n• Grind just before brewing\n• Water: 195-205°F (just off boil)\n• Ratio: 1:15 (1g coffee : 15g water)\n• Filtered water (chlorine affects taste)\n\n**Methods Ranked (flavor):**\n1. Pour-over (V60, Chemex)\n2. French press\n3. AeroPress\n4. Moka pot\n5. Drip machine\n\n**Health Benefits:**\n• Improved focus and energy\n• Antioxidants\n• Reduced risk of Parkinson's, diabetes, some cancers\n\n**Downsides:** Dependence, anxiety in excess, sleep disruption.`],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // FINANCE & MONEY
  // ═══════════════════════════════════════════════════════════════════════
  {
    patterns: [/save\s+money|saving|budget|financial|finance\s+tip|money\s+manage/i],
    responses: [`Financial management, Sir:\n\n**Budgeting Frameworks:**\n• **50/30/20**: 50% needs, 30% wants, 20% savings\n• **Zero-based**: every dollar assigned a job\n• **Pay yourself first**: automate savings before spending\n\n**Priority Order:**\n1. Emergency fund (3-6 months expenses)\n2. High-interest debt payoff\n3. 401k match (free money)\n4. Remaining debt\n5. Invest (Roth IRA, brokerage)\n\n**Saving Tips:**\n• Track spending for 30 days (awareness helps)\n• Automate savings\n• 24-hour rule for purchases over $100\n• Cook at home more\n• Cancel unused subscriptions\n• Negotiate bills annually\n\n**Mindset:**\n• Wealth = income - spending\n• Increase income AND decrease expenses\n• Live below your means\n• Avoid lifestyle inflation`],
  },
  {
    patterns: [/invest|investing|stock|401k|ira|retirement|portfolio/i],
    responses: [`Investment basics, Sir:\n\n**Getting Started:**\n1. Max 401k employer match (instant 100% return)\n2. Roth IRA ($7,000/year limit)\n3. Taxable brokerage account\n\n**Simple Strategy (works for most):**\n• Low-cost index funds (total market or S&P 500)\n• Target-date retirement funds\n• Hold long-term (don't time the market)\n\n**Asset Allocation:**\n• Rule of thumb: 110 - age = % in stocks\n• Example: Age 30 = 80% stocks, 20% bonds\n• Rebalance annually\n\n**Principles:**\n• Start early (compound interest is powerful)\n• Consistency beats timing\n• Low fees matter over time\n• Diversify\n• Don't panic sell\n\n**Avoid:**\n• Individual stock picking (usually)\n• Crypto as main investment\n• High-fee actively managed funds\n• Timing the market\n\n**Resources:** Bogleheads forum, r/personalfinance wiki`],
  },
  {
    patterns: [/negotiate|negotiation|raise|salary|pay\s+increase|ask.*more\s+money/i],
    responses: [`Salary negotiation strategy, Sir:\n\n**Preparation:**\n1. Research market rate (Glassdoor, LinkedIn, Levels.fyi)\n2. Document your contributions with numbers\n3. Time it after wins or positive reviews\n4. Practice out loud\n\n**The Conversation:**\n• Lead with value: "Based on my contributions..."\n• Give a range (anchor high)\n• Silence is powerful — let them respond\n• Consider total compensation (equity, benefits, flexibility)\n\n**Phrases:**\n• "Based on my research and contributions, I believe $X is appropriate"\n• "Is there flexibility on this?"\n• "What would I need to do to earn X?"\n\n**If They Say No:**\n• Ask: "What would need to change?"\n• Get timeline for revisit\n• Negotiate other benefits\n\n**Tips:**\n• Never give a number first if possible\n• Don't accept immediately (sleep on it)\n• Get offers in writing\n• Be willing to walk away`],
  },
  {
    patterns: [/credit\s+score|credit\s+card|debt|loan|borrow|interest\s+rate/i],
    responses: [`Credit management, Sir:\n\n**Credit Score Factors:**\n• Payment history (35%) — never miss a payment\n• Utilization (30%) — keep below 30%, ideally 10%\n• Length of history (15%) — don't close old cards\n• New credit (10%) — limit hard inquiries\n• Credit mix (10%) — variety helps slightly\n\n**Building Credit:**\n• Secured card if starting out\n• Authorized user on parent's card\n• Pay in full every month\n• Don't carry balances\n\n**Debt Payoff Strategies:**\n• **Avalanche**: highest interest first (mathematically optimal)\n• **Snowball**: smallest balance first (psychological wins)\n\n**Credit Card Rules:**\n• Pay full balance monthly (avoid interest)\n• Never pay just minimum\n• Use for rewards, not to extend budget\n• Set up autopay\n\n**Check credit:** Free at annualcreditreport.com (1x/year each bureau)`],
  },
  {
    patterns: [/tax|taxes|deduct|irs|file.*tax|tax\s+tip/i],
    responses: [`Tax basics, Sir:\n\n**Key Deadlines:**\n• April 15: Individual filing deadline\n• October 15: Extended deadline\n• January 15: Q4 estimated tax due\n\n**Common Deductions:**\n• Student loan interest\n• Home mortgage interest\n• State/local taxes (up to $10k)\n• Charitable donations\n• Medical expenses (>7.5% AGI)\n• Self-employment expenses\n\n**Tax-Advantaged Accounts:**\n• 401k: pre-tax, grows tax-free\n• Roth IRA: after-tax, withdrawals tax-free\n• HSA: triple tax advantage (if eligible)\n• 529: education savings\n\n**Filing Tips:**\n• Gather documents early\n• Standard vs itemized (whichever is higher)\n• Don't overpay withholding (interest-free loan to IRS)\n• Consider a CPA for complex situations\n\n**Self-Employed:**\n• Quarterly estimated payments required\n• Track all business expenses\n• Home office deduction may apply`],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // RELATIONSHIPS & SOCIAL
  // ═══════════════════════════════════════════════════════════════════════
  {
    patterns: [/relationship\s+advice|partner|boyfriend|girlfriend|spouse|marriage|dating/i],
    responses: [`Relationship wisdom, Sir:\n\n**Fundamentals:**\n• Communication is everything\n• Listen to understand, not to respond\n• Express needs directly (don't assume they know)\n• Appreciate out loud, criticize in private\n\n**Conflict Resolution:**\n• "I feel..." not "You always..."\n• Address issues promptly (don't stew)\n• Attack the problem, not the person\n• Take breaks when heated (but return)\n\n**Maintaining Connection:**\n• Quality time (phones away)\n• Physical affection daily\n• Express gratitude often\n• Support their goals\n• Share responsibilities fairly\n\n**Red Flags:**\n• Consistent disrespect\n• Control/isolation\n• Dishonesty\n• Refusing to communicate\n• Contempt (worst predictor of divorce)\n\n**Remember:** You can't change someone who doesn't want to change.`],
  },
  {
    patterns: [/friend|friendship|lonely|make\s+friends|social\s+life|meet\s+people/i],
    responses: [`Building friendships, Sir:\n\n**Making Friends (as adult):**\n• Repeated exposure + shared interest = friendship\n• Join clubs, classes, sports leagues\n• Say yes to invitations\n• Host small gatherings\n• Apps: Meetup, Bumble BFF\n\n**Deepening Friendships:**\n• Initiate plans (don't just wait)\n• Remember details about their life\n• Be reliable and consistent\n• Show up during hard times\n• Vulnerability builds connection\n\n**Maintaining:**\n• Regular check-ins (set reminders)\n• Quality over quantity\n• Accept that friendships ebb and flow\n• Different friends for different needs\n\n**If Lonely:**\n• It's more common than you think\n• Loneliness is not a character flaw\n• Start with acquaintances\n• Consistency matters more than intensity\n• Consider therapy if persistent\n\nFriendship requires effort and initiative, Sir.`],
  },
  {
    patterns: [/gift|present|birthday.*idea|what.*buy.*someone|anniversary|holiday\s+gift/i],
    responses: [`Gift selection strategy, Sir:\n\n**Tier 1 — Experiences:**\n• Concert/show tickets\n• Cooking class\n• Spa day\n• Trip or adventure\n• Nice dinner out\n\n**Tier 2 — Personalized:**\n• Custom engraving\n• Photo book or art\n• Monogrammed items\n• Something related to their hobby\n\n**Tier 3 — Quality Consumables:**\n• Premium coffee/tea/wine\n• Artisan chocolate\n• Fancy skincare\n• Subscription box\n\n**Always Works:**\n• Heartfelt handwritten letter + small thoughtful gift\n• Something they mentioned wanting months ago\n• Upgrade of something they use daily\n\n**Gift Ideas by Recipient:**\n• Parents: experiences together, practical upgrades\n• Partner: thoughtfulness > price tag\n• Coworker: keep it neutral and useful\n• Kids: experiences, not just things\n\n**The best gifts show you've been paying attention.**`],
  },
  {
    patterns: [/apolog|sorry|made\s+mistake|hurt.*feeling|messed\s+up|forgive/i],
    responses: [`The art of apology, Sir:\n\n**Effective Apology Formula:**\n1. Acknowledge specifically what you did\n2. Take responsibility (no excuses)\n3. Express understanding of impact\n4. Commit to change\n5. Ask how to make it right\n\n**Good Example:**\n"I'm sorry I forgot our dinner plans. I know that made you feel unimportant, and you deserved better. I'm setting reminders now to prevent this. What can I do to make it up to you?"\n\n**Avoid:**\n• "I'm sorry you feel that way" (not an apology)\n• "I'm sorry, but..." (negates apology)\n• Over-apologizing (becomes meaningless)\n• Expecting immediate forgiveness\n\n**If You're Receiving:**\n• You don't have to forgive immediately\n• Forgiveness ≠ reconciliation\n• Forgiveness is for you, not them\n\n**Remember:** A sincere apology requires changed behavior, not just words.`],
  },
  {
    patterns: [/small\s+talk|conversation|talk.*people|social.*awkward|introvert|networking/i],
    responses: [`Conversation skills, Sir:\n\n**Starting Conversations:**\n• Comment on shared environment\n• Ask open-ended questions\n• Give genuine compliments\n• Use FORD: Family, Occupation, Recreation, Dreams\n\n**Keeping It Going:**\n• Listen actively (nod, "mm-hmm")\n• Ask follow-up questions\n• Share related personal stories\n• Find common ground\n\n**Body Language:**\n• Eye contact (but not staring)\n• Open posture (uncrossed arms)\n• Slight lean in\n• Smile genuinely\n\n**For Introverts:**\n• Prepare topics in advance\n• Set a goal (talk to 3 people)\n• Arrive early (easier to meet people)\n• Take breaks when drained\n• Quality over quantity\n\n**Networking:**\n• Focus on giving, not getting\n• Follow up within 48 hours\n• Connect people to each other\n• Be memorable (have a unique story)\n\nRemember: People like talking about themselves. Ask questions, Sir.`],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // CAREER & PROFESSIONAL
  // ═══════════════════════════════════════════════════════════════════════
  {
    patterns: [/interview|job\s+interview|prepare.*interview|interview\s+tip/i],
    responses: [`Interview preparation, Sir:\n\n**Before:**\n• Research company thoroughly (mission, news, culture)\n• Prepare STAR stories (Situation, Task, Action, Result)\n• Practice common questions aloud\n• Prepare questions to ask THEM\n• Plan outfit (one level above company norm)\n\n**Common Questions:**\n• Tell me about yourself (2-minute elevator pitch)\n• Why this company?\n• Greatest strength/weakness\n• Tell me about a challenge you overcame\n• Where do you see yourself in 5 years?\n\n**During:**\n• Arrive 10-15 minutes early\n• Firm handshake, eye contact\n• Answer concisely (not rambling)\n• Use specific examples\n• Show enthusiasm\n\n**After:**\n• Send thank-you email within 24 hours\n• Reference specific conversation points\n• Reiterate interest\n\n**Mindset:** You're interviewing them too.`],
  },
  {
    patterns: [/resume|cv|job\s+application|apply.*job|cover\s+letter/i],
    responses: [`Resume optimization, Sir:\n\n**Format:**\n• One page (unless 10+ years experience)\n• Clean, consistent formatting\n• PDF format\n• ATS-friendly (standard fonts, no graphics)\n\n**Content:**\n• Contact info + LinkedIn\n• Summary (optional, 2-3 lines)\n• Experience (reverse chronological)\n• Education\n• Skills\n\n**Writing Bullets:**\n• Action verb + task + result\n• Quantify everything possible\n• "Managed team of 5" not "Was a team leader"\n• "Increased sales 25%" not "Improved sales"\n\n**Common Mistakes:**\n• Typos (instant rejection)\n• Too generic\n• Too long\n• Duties instead of achievements\n• Irrelevant experience\n\n**Cover Letter:**\n• Customize for each role\n• Why this company + why you're a fit\n• Keep it brief (3-4 paragraphs)\n• Personality is okay`],
  },
  {
    patterns: [/quit.*job|leave.*job|resign|new\s+job|career\s+change|hate.*job/i],
    responses: [`Career transition guidance, Sir:\n\n**Before Quitting:**\n• Have 3-6 months expenses saved\n• Line up next opportunity if possible\n• Document your achievements\n• Don't burn bridges (world is small)\n\n**Resignation Process:**\n• Give proper notice (usually 2 weeks)\n• Tell your boss first (in person if possible)\n• Written resignation letter\n• Offer to help transition\n• Exit interview (be diplomatic)\n\n**Career Change:**\n• Identify transferable skills\n• Network in target industry\n• Consider lateral move first\n• Upskill (courses, certifications)\n• Side projects to build portfolio\n\n**Signs to Leave:**\n• Dreading work consistently\n• No growth opportunity\n• Toxic environment\n• Values misalignment\n• Health impacts\n\n**Stay Professional:** Your reputation follows you.`],
  },
  {
    patterns: [/work.*home|remote\s+work|wfh|home\s+office|work\s+life\s+balance/i],
    responses: [`Remote work optimization, Sir:\n\n**Workspace:**\n• Dedicated work area (not bed)\n• Ergonomic setup (monitor at eye level)\n• Good lighting (natural if possible)\n• Minimal distractions\n\n**Routine:**\n• Fixed start/end times\n• Get dressed (psychologically matters)\n• Morning routine before "commute"\n• Regular breaks (Pomodoro works well)\n• "Commute" ritual (walk around block)\n\n**Communication:**\n• Over-communicate (no hallway chats)\n• Video on when possible\n• Respond promptly to messages\n• Schedule check-ins\n\n**Boundaries:**\n• Don't work where you sleep\n• Log off at set time\n• Take actual lunch break\n• Say no to 24/7 availability\n\n**Challenges:**\n• Combat loneliness (virtual coffees, coworking)\n• Stay visible (document contributions)\n• Avoid distractions (app blockers)\n\nSeparation of work and life is essential.`],
  },
  {
    patterns: [/public\s*speak|speak.*public|presentation|give.*speech|stage\s+fright|nervous.*present|afraid.*speak|fear.*speak/i],
    responses: [`Public speaking mastery, Sir:\n\n**Preparation:**\n• Know your material cold\n• Practice aloud (10+ times)\n• Record yourself\n• Time it\n• Prepare for tech failures\n\n**Structure:**\n• Tell them what you'll tell them\n• Tell them\n• Tell them what you told them\n\n**Managing Nerves:**\n• Nervousness = excitement (reframe it)\n• Deep breathing before\n• Power pose (2 minutes)\n• Focus on message, not yourself\n• Arrive early, get comfortable\n\n**Delivery:**\n• Speak slower than feels natural\n• Pause for emphasis\n• Eye contact (different sections)\n• Move with purpose\n• Use gestures naturally\n\n**Engage Audience:**\n• Start with story or question\n• Use "you" language\n• Include visuals\n• End with clear call to action\n\nThe audience wants you to succeed, Sir.`],
  },
  {
    patterns: [/email|write.*email|professional.*email|email\s+etiquette/i],
    responses: [`Email excellence, Sir:\n\n**Structure:**\n• Clear subject line (action if needed)\n• Brief greeting\n• Purpose in first sentence\n• Body (concise paragraphs)\n• Clear call to action\n• Professional sign-off\n\n**Subject Line Examples:**\n• "Action Required: Q3 Report by Friday"\n• "Quick Question: Budget Approval"\n• "FYI: Policy Update"\n\n**Best Practices:**\n• One topic per email\n• Bottom line up front (BLUF)\n• Use bullet points for multiple items\n• Proofread before sending\n• CC sparingly\n• Reply within 24 hours\n\n**Avoid:**\n• All caps (feels like shouting)\n• Reply all (unless necessary)\n• Long paragraphs\n• Emotional responses (draft, wait, revise)\n• Important news via email only\n\n**Timing:** Emails sent Tuesday-Thursday, 9-11 AM get best response rates.`],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // HOME & PRACTICAL
  // ═══════════════════════════════════════════════════════════════════════
  {
    patterns: [/laundry|wash.*clothes|stain|iron|wrinkle|dryer/i],
    responses: [`Laundry mastery, Sir:\n\n**Sorting:**\n• Darks, lights, whites separately\n• Separate by fabric weight\n• Check pockets\n\n**Temperature:**\n• Cold: darks, delicates, most things\n• Warm: whites, towels\n• Hot: sanitizing (underwear, sheets when sick)\n\n**Stain Removal:**\n• Treat ASAP\n• Cold water first (hot sets many stains)\n• Coffee/wine: cold water + dish soap\n• Grease: dish soap or baking soda\n• Blood: cold water only\n• Ink: rubbing alcohol\n\n**Drying:**\n• Air dry delicates and anything you care about\n• Clean lint trap every load\n• Don't over-dry (causes shrinkage)\n\n**Tips:**\n• Inside-out for printed shirts\n• Zip zippers, unbutton buttons\n• Vinegar in rinse cycle softens\n• Mesh bags for delicates\n• Don't overload machine`],
  },
  {
    patterns: [/clean|cleaning|house\s+clean|tidy\s+up|housework|chore/i],
    responses: [`Cleaning protocol, Sir:\n\n**Daily (10 min):**\n• Make bed\n• Dishes done/loaded\n• Wipe kitchen counters\n• Quick clutter pickup\n\n**Weekly:**\n• Vacuum/sweep floors\n• Bathroom wipe-down\n• Change bed sheets\n• Take out trash/recycling\n• Laundry\n\n**Monthly:**\n• Deep clean bathroom\n• Clean kitchen appliances\n• Dust surfaces\n• Wash bedding/towels thoroughly\n\n**Cleaning Order:**\n• Top to bottom (dust falls)\n• Dry before wet\n• Least dirty to most dirty\n\n**Products (all you need):**\n• All-purpose cleaner\n• Glass cleaner\n• Disinfectant\n• Baking soda (scrubbing)\n• White vinegar (descaling)\n\n**Mindset:** Clean as you go. Little and often beats big and rarely.`],
  },
  {
    patterns: [/move|moving|new\s+apartment|relocat|pack.*house/i],
    responses: [`Moving checklist, Sir:\n\n**8 Weeks Before:**\n• Research moving companies (get 3 quotes)\n• Start decluttering (donate, sell, trash)\n• Create moving binder/folder\n\n**4 Weeks Before:**\n• Gather supplies (boxes, tape, markers)\n• Begin packing non-essentials\n• Change address (USPS, banks, subscriptions)\n• Notify utilities (cancel old, set up new)\n\n**1 Week Before:**\n• Pack room by room, label clearly\n• Essentials box (toilet paper, phone charger, snacks)\n• Confirm movers\n• Clean old place\n\n**Moving Day:**\n• Walk through both places\n• Photograph meter readings\n• Keep valuables with you\n• Tip movers if appropriate\n\n**Packing Tips:**\n• Heavy items in small boxes\n• Fill empty spaces (prevents shifting)\n• Fragiles marked clearly\n• Keep hardware in labeled bags\n\nCreate a first-night box with essentials.`],
  },
  {
    patterns: [/\bcar\b|automotive|vehicle|driving\s+tip|car\s+maintenance|oil\s+change/i],
    responses: [`Car maintenance, Sir:\n\n**Regular Schedule:**\n• Oil change: every 5,000-7,500 miles (check owner's manual)\n• Tire rotation: every 5,000-7,500 miles\n• Air filter: every 15,000-30,000 miles\n• Brake inspection: every 10,000-15,000 miles\n• Coolant flush: every 30,000 miles\n\n**Monthly Checks:**\n• Tire pressure (affects fuel economy and safety)\n• All fluid levels\n• Lights working\n• Windshield wipers\n\n**Warning Signs:**\n• Check engine light (don't ignore)\n• Strange noises (grinding, squealing)\n• Pulling to one side\n• Vibrations\n• Smoke or unusual smells\n\n**Fuel Efficiency:**\n• Proper tire pressure\n• Remove excess weight\n• Smooth acceleration\n• Cruise control on highway\n\n**Keep in Car:**\n• Registration, insurance\n• Jumper cables\n• First aid kit\n• Flashlight\n• Tire inflator or spare`],
  },
  {
    patterns: [/plant|garden|gardening|grow.*plant|houseplant|succulent/i],
    responses: [`Plant care guide, Sir:\n\n**Beginner-Friendly Houseplants:**\n• Pothos (very forgiving)\n• Snake plant (low water, low light)\n• Spider plant (hard to kill)\n• ZZ plant (thrives on neglect)\n• Peace lily (tells you when thirsty)\n\n**Basic Care:**\n• Water when top inch of soil is dry\n• Most plants prefer indirect light\n• Drainage holes are essential\n• Fertilize during growing season (spring/summer)\n\n**Common Mistakes:**\n• Overwatering (biggest killer)\n• Too little light\n• Wrong pot size\n• No drainage\n\n**Signs of Problems:**\n• Yellow leaves: usually overwatering\n• Brown tips: underwatering or low humidity\n• Leggy growth: not enough light\n• Wilting: check soil moisture\n\n**Pro Tips:**\n• Rotate plants for even growth\n• Wipe leaves monthly\n• Repot every 1-2 years\n• Humidity trays for tropicals`],
  },
  {
    patterns: [/pet|dog|cat|puppy|kitten|animal\s+care/i],
    responses: [`Pet care essentials, Sir:\n\n**Dogs:**\n• Daily: fresh water, 2 meals, 30-60 min exercise, mental stimulation\n• Weekly: brush coat, check ears\n• Monthly: nail trim, flea/tick prevention\n• Annually: vet checkup, vaccines, dental\n\n**Cats:**\n• Daily: fresh water, 2 meals, clean litter\n• Weekly: brush (more for long-hair)\n• Monthly: nail trim (if indoor), flea prevention\n• Annually: vet checkup, vaccines\n\n**Training (dogs):**\n• Positive reinforcement only\n• Consistency is key\n• Short sessions (5-10 min)\n• Socialize early\n\n**Signs of Illness:**\n• Changes in eating/drinking\n• Lethargy\n• Vomiting/diarrhea\n• Difficulty breathing\n• Hiding (cats)\n\n**Basics:**\n• ID tags + microchip\n• Pet insurance (consider it)\n• Pet-proof your home\n• Routine vet visits\n\nPets need time, money, and commitment. They're family.`],
  },
  {
    patterns: [/first\s+aid|emergency|hurt|injured|bleed|burn|chok/i],
    responses: [`First aid basics, Sir:\n\n**Bleeding:**\n• Apply firm pressure with clean cloth\n• Keep pressure for 10-15 minutes\n• Elevate wound if possible\n• Seek help if bleeding doesn't stop\n\n**Burns:**\n• Cool under running water 10-20 min\n• Do NOT use ice, butter, or toothpaste\n• Cover with clean bandage\n• Seek help for large or deep burns\n\n**Choking (adult):**\n• Ask "Are you choking?"\n• 5 back blows between shoulder blades\n• 5 abdominal thrusts (Heimlich)\n• Repeat until cleared or unconscious\n\n**CPR (if unresponsive):**\n• Call 911 first\n• 30 chest compressions (hard and fast, 2 inches deep)\n• 2 rescue breaths\n• Repeat\n\n**Heart Attack Signs:**\n• Chest pain/pressure\n• Pain in arm, neck, jaw\n• Shortness of breath\n• Cold sweat, nausea\n→ Call 911 immediately\n\n**When in Doubt:** Call 911 or go to ER.`],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // TECHNOLOGY
  // ═══════════════════════════════════════════════════════════════════════
  {
    patterns: [/password|security.*online|protect.*account|cyber|hack/i],
    responses: [`Digital security, Sir:\n\n**Passwords:**\n• Unique password for every account\n• Use a password manager (1Password, Bitwarden)\n• 16+ characters, random\n• Never reuse passwords\n\n**Two-Factor Authentication:**\n• Enable on all important accounts\n• Authenticator app > SMS\n• Backup codes stored safely\n\n**Phishing:**\n• Don't click suspicious links\n• Verify sender addresses carefully\n• When in doubt, go directly to website\n• Banks never ask for passwords via email\n\n**General:**\n• Keep software updated\n• Avoid public WiFi for sensitive tasks\n• Regular backups (3-2-1 rule)\n• Review account permissions\n\n**If Compromised:**\n• Change password immediately\n• Enable 2FA\n• Check for unauthorized activity\n• Contact company if needed\n\nUse HaveIBeenPwned.com to check if credentials leaked.`],
  },
  {
    patterns: [/phone.*battery|battery.*life|charge|phone.*slow|storage|phone.*hot/i],
    responses: [`Phone optimization, Sir:\n\n**Battery Life:**\n• Reduce screen brightness / auto-brightness\n• Disable unnecessary notifications\n• Turn off location services when not needed\n• Close unused apps (on Android especially)\n• Low power mode when needed\n• Avoid extreme temperatures\n\n**Battery Health:**\n• Don't charge to 100% constantly (80% is optimal)\n• Don't let it die completely regularly\n• Use official charger\n• Avoid charging while using intensively\n\n**Storage:**\n• Clear cached data\n• Offload photos to cloud\n• Delete unused apps\n• Clear message attachments\n\n**Performance:**\n• Restart weekly\n• Keep OS updated\n• Factory reset if persistently slow\n\n**Overheating:**\n• Remove case while charging\n• Close demanding apps\n• Avoid direct sunlight\n• Turn off if very hot`],
  },
  {
    patterns: [/computer.*slow|laptop.*slow|pc.*slow|speed.*computer|clean.*computer/i],
    responses: [`Computer optimization, Sir:\n\n**Quick Fixes:**\n• Restart (seriously, it helps)\n• Close unused programs/tabs\n• Check for malware (run scan)\n• Free up disk space (20% should be free)\n\n**Windows:**\n• Disable startup programs (Task Manager > Startup)\n• Run Disk Cleanup\n• Defragment HDD (not SSD)\n• Check for Windows updates\n\n**Mac:**\n• Clear system cache\n• Manage startup items (System Preferences)\n• Check Activity Monitor for resource hogs\n• Update macOS\n\n**Hardware Upgrades:**\n• SSD (biggest impact if still on HDD)\n• RAM (if constantly using swap)\n\n**Browser:**\n• Clear cache and cookies\n• Disable unused extensions\n• Use fewer tabs\n\n**Long-term:**\n• Uninstall unused programs\n• Keep 20%+ storage free\n• Regular restarts\n• Avoid "optimizer" software (often bloatware)`],
  },
  {
    patterns: [/wifi|internet\s+slow|connection|router|network/i],
    responses: [`Internet troubleshooting, Sir:\n\n**Quick Fixes:**\n• Restart modem and router (unplug 30 sec)\n• Move closer to router\n• Disconnect other devices temporarily\n• Try different device (isolate problem)\n\n**Optimize WiFi:**\n• Router in central, elevated location\n• Away from microwaves, cordless phones\n• Update router firmware\n• Use 5GHz for speed (2.4GHz for range)\n• Change channel if congested\n\n**Speed Issues:**\n• Test speed: speedtest.net\n• Compare to what you're paying for\n• Consider mesh network for large homes\n• Ethernet for stationary devices\n\n**Security:**\n• Strong, unique WiFi password\n• WPA3 or WPA2 encryption\n• Change default admin credentials\n• Guest network for visitors\n\n**When to Call ISP:**\n• Consistently below advertised speeds\n• Frequent disconnections\n• Problem isolated to modem\n• After trying basic troubleshooting`],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // TRAVEL
  // ═══════════════════════════════════════════════════════════════════════
  {
    patterns: [/travel\s+tip|packing|what.*pack|luggage|trip\s+advice|vacation|fly|flight/i],
    responses: [`Travel preparation, Sir:\n\n**Packing:**\n• Roll clothes (saves space, reduces wrinkles)\n• Pack outfits, not items\n• Carry-on essentials: meds, change of clothes, valuables\n• Compression bags for bulky items\n• Packing cubes for organization\n\n**Before Trip:**\n• Passport valid 6+ months beyond travel\n• Copy documents, email to yourself\n• Notify bank of travel dates\n• Download offline maps\n• Check visa requirements\n\n**At Airport:**\n• Arrive 2 hours domestic, 3 hours international\n• Online check-in\n• TSA: 3-1-1 rule for liquids\n• Wear easy-remove shoes and layers\n\n**Jet Lag:**\n• Adjust sleep schedule before travel\n• Stay hydrated on flight\n• Get sunlight at destination\n• Avoid alcohol and caffeine\n\n**Money:**\n• Notify credit cards\n• Have some local currency\n• Check foreign transaction fees\n• Backup payment method`],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // EDUCATION & LEARNING
  // ═══════════════════════════════════════════════════════════════════════
  {
    patterns: [/study\s+tip|study\s+technique|studying|exam|test.*prep|memoriz|remember.*better|how\s+to\s+study/i],
    responses: [`Learning optimization, Sir:\n\n**Effective Study Techniques:**\n• Active recall (test yourself, don't just re-read)\n• Spaced repetition (review at increasing intervals)\n• Teach someone else (best way to learn)\n• Practice problems (apply knowledge)\n\n**Avoid:**\n• Passive re-reading\n• Highlighting everything\n• Cramming (doesn't build long-term memory)\n• Multitasking\n\n**Memory Techniques:**\n• Chunking (group related information)\n• Mnemonics and acronyms\n• Memory palace (visualize in familiar places)\n• Association (link new to known)\n\n**Environment:**\n• Consistent study location\n• Minimize distractions\n• Background noise or silence (preference)\n• Pomodoro technique (25 min focus)\n\n**Before Exams:**\n• Review, don't cram new material\n• Good sleep (memory consolidates during sleep)\n• Light exercise\n• Eat well\n\nConsistency beats intensity for learning.`],
  },
  {
    patterns: [/book.*recommend|what.*read|reading|self\s+improvement|best\s+books/i],
    responses: [`Book recommendations, Sir:\n\n**Productivity:**\n• "Atomic Habits" — James Clear\n• "Deep Work" — Cal Newport\n• "Getting Things Done" — David Allen\n\n**Psychology/Thinking:**\n• "Thinking, Fast and Slow" — Daniel Kahneman\n• "Influence" — Robert Cialdini\n• "Sapiens" — Yuval Noah Harari\n\n**Finance:**\n• "The Psychology of Money" — Morgan Housel\n• "I Will Teach You to Be Rich" — Ramit Sethi\n• "The Simple Path to Wealth" — JL Collins\n\n**Communication:**\n• "How to Win Friends and Influence People" — Dale Carnegie\n• "Never Split the Difference" — Chris Voss\n• "Crucial Conversations" — Patterson et al.\n\n**Creativity:**\n• "Steal Like an Artist" — Austin Kleon\n• "The War of Art" — Steven Pressfield\n\n**Reading Tip:** 20 minutes daily = ~25 books/year.`],
  },
  {
    patterns: [/\blanguage\b|learn.*language|speak.*language|foreign\s+language|bilingual|duolingo/i],
    responses: [`Language learning, Sir:\n\n**Method:**\n1. Start with most common 1000 words\n2. Learn phrases, not just words\n3. Grammar comes naturally with exposure\n4. Listen extensively (podcasts, music)\n5. Speak from day one (even poorly)\n\n**Daily Practice:**\n• Duolingo/Babbel: 15-30 min\n• Podcasts for learners\n• Change phone language\n• Label items in your home\n• Think in the language\n\n**Speaking:**\n• iTalki for tutors\n• Language exchange apps (Tandem, HelloTalk)\n• Don't fear mistakes\n• Record yourself\n\n**Immersion:**\n• Movies/TV with subtitles (target language)\n• News in target language\n• Travel if possible\n\n**Realistic Timeline:**\n• Basic conversation: 3-6 months\n• Comfortable: 1-2 years\n• Fluent: 3-5 years of consistent practice\n\nConsistency > intensity. Daily practice wins.`],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // MISCELLANEOUS
  // ═══════════════════════════════════════════════════════════════════════
  {
    patterns: [/\bbored\b|what\s+should\s+i\s+do\s*$|fun.*idea|entertainment|nothing\s+to\s+do/i],
    responses: [`Boredom solutions, Sir:\n\n**Creative:**\n• Learn an instrument\n• Try cooking a new cuisine\n• Write (journal, story, blog)\n• Draw, paint, photography\n• Start a DIY project\n\n**Physical:**\n• Try a new workout\n• Go for a hike\n• Learn to dance (YouTube tutorials)\n• Play a sport\n\n**Learning:**\n• Online course (Coursera, Skillshare)\n• Documentary marathon\n• Learn a language\n• Read that book you've been postponing\n\n**Social:**\n• Call someone you haven't spoken to\n• Host a game night\n• Volunteer\n• Join a club or group\n\n**Productive:**\n• Declutter a space\n• Learn a new skill\n• Plan future goals\n• Organize digital files\n\n**Quick:**\n• Puzzle games\n• Podcast\n• Explore new music\n• People-watching at a café\n\nBoredom is unallocated potential, Sir.`],
  },
  {
    patterns: [/\bhabit\b|build.*habit|break.*habit|daily\s+routine|morning\s+routine|stick.*with|form.*habit/i],
    responses: [`Habit formation, Sir:\n\n**The Science:**\n• Habits form through: Cue → Routine → Reward\n• Takes 21-66 days to form (average 66)\n• Start ridiculously small\n\n**Building Habits:**\n1. Start tiny (2 min version)\n2. Attach to existing habit (habit stacking)\n3. Make it obvious (environment design)\n4. Track progress visibly\n5. Never miss twice\n\n**Examples:**\n• Want to read more? Start with 1 page after morning coffee\n• Want to exercise? Start with 2 pushups after brushing teeth\n• Want to meditate? 1 minute before bed\n\n**Breaking Bad Habits:**\n• Make it invisible (remove cues)\n• Make it difficult (increase friction)\n• Replace with better habit\n• Identify triggers\n\n**Systems:**\n• Habit tracker (app or paper)\n• Accountability partner\n• Reward yourself (but not counterproductively)\n\n"You don't rise to the level of your goals; you fall to the level of your systems." — James Clear`],
  },
  {
    patterns: [/skin\s*care|skincare|acne|pimple|moisturiz|sunscreen|face\s*(routine|wash|care|cream)|complexion|facial/i],
    responses: [`Skincare fundamentals, Sir:\n\n**Basic Routine (morning):**\n1. Cleanser (gentle, not stripping)\n2. Moisturizer\n3. Sunscreen SPF 30+ (non-negotiable)\n\n**Basic Routine (night):**\n1. Cleanser (double cleanse if wearing sunscreen)\n2. Treatment (retinol, acids — optional)\n3. Moisturizer\n\n**For Acne:**\n• Salicylic acid (unclogs pores)\n• Benzoyl peroxide (kills bacteria)\n• Niacinamide (reduces inflammation)\n• Don't over-treat (worsens things)\n\n**General Tips:**\n• Don't touch your face\n• Change pillowcases weekly\n• Hydrate and sleep well\n• Gentle is better than harsh\n• Patch test new products\n\n**Sun Protection:**\n• Daily SPF 30+ minimum\n• Reapply every 2 hours if outside\n• UV damage is cumulative\n\n**When to See Dermatologist:**\n• Persistent acne\n• Unusual moles\n• Chronic conditions`],
  },
  {
    patterns: [/fashion|dress|what.*wear|outfit|style|clothes|wardrobe/i],
    responses: [`Style fundamentals, Sir:\n\n**Wardrobe Essentials:**\n• Well-fitting dark jeans\n• White and navy t-shirts\n• Oxford button-down (white, light blue)\n• Navy blazer\n• Chinos (navy, khaki, gray)\n• Quality leather shoes\n• Versatile jacket\n\n**Fit is King:**\n• Shoulders should match\n• No pulling at buttons\n• Pants break at shoe (or no break)\n• Tailor is your friend\n\n**Color Coordination:**\n• Start with neutrals (navy, white, gray, black)\n• Add one statement piece\n• Match metals\n• Belt matches shoes (loosely)\n\n**Building Wardrobe:**\n• Quality over quantity\n• Basics first, trends later\n• Cost per wear (better to invest)\n• Buy for your current body\n\n**Occasions:**\n• Business casual: chinos + button-down + nice shoes\n• Smart casual: add blazer\n• Formal: suit, tie, dress shoes\n\nConfidence is the best accessory, Sir.`],
  },
  {
    patterns: [/age|aging|feel.*old|getting\s+older|longevity|live\s+longer/i],
    responses: [`Healthy aging strategies, Sir:\n\n**Lifestyle Fundamentals:**\n• Exercise (both cardio and strength)\n• Quality sleep (7-9 hours)\n• Balanced nutrition (Mediterranean diet ranks high)\n• Social connections (strong predictor of longevity)\n• Purpose and engagement\n\n**Key Factors:**\n• Don't smoke (biggest impact)\n• Limit alcohol\n• Maintain healthy weight\n• Manage stress\n• Regular health screenings\n\n**Brain Health:**\n• Continuous learning\n• Social engagement\n• Physical exercise (improves cognition)\n• Quality sleep (clears brain toxins)\n• Novel experiences\n\n**What Research Shows:**\n• Blue Zone communities share: movement, purpose, community, plant-based eating\n• Social isolation is as harmful as smoking\n• Strength training prevents muscle loss\n• Mindset matters (positive attitudes correlate with longevity)\n\n**Regular Checks:**\n• Blood pressure, cholesterol, glucose\n• Cancer screenings as recommended\n• Vision and hearing\n• Dental health`],
  },
  {
    patterns: [/convert|conversion|how\s+many.*in/i],
    responses: [`Common conversions, Sir:\n\n**Length:**\n• 1 inch = 2.54 cm\n• 1 foot = 30.48 cm\n• 1 mile = 1.609 km\n• 1 meter = 3.281 feet\n\n**Weight:**\n• 1 pound = 0.454 kg\n• 1 kg = 2.205 pounds\n• 1 ounce = 28.35 grams\n\n**Volume:**\n• 1 gallon = 3.785 liters\n• 1 liter = 0.264 gallons\n• 1 cup = 236 ml\n• 1 tablespoon = 15 ml\n• 1 teaspoon = 5 ml\n\n**Temperature:**\n• °F to °C: (F - 32) × 5/9\n• °C to °F: (C × 9/5) + 32\n• Water freezes: 32°F / 0°C\n• Water boils: 212°F / 100°C\n\n**Cooking:**\n• 3 teaspoons = 1 tablespoon\n• 16 tablespoons = 1 cup\n• 2 cups = 1 pint\n• 4 cups = 1 quart\n• 4 quarts = 1 gallon\n\nNeed a specific conversion? Just ask.`],
  },
];

function matchKnowledge(query: string): string | null {
  const lower = query.toLowerCase();
  for (const entry of KNOWLEDGE_BASE) {
    for (const pattern of entry.patterns) {
      if (pattern.test(lower)) {
        return pick(entry.responses);
      }
    }
  }
  return null;
}

// ─── Math Functions ────────────────────────────────────────────────────
function tryMath(query: string): string | null {
  const lower = query.toLowerCase();
  const pctMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:%|percent)\s*of\s*(\d+(?:\.\d+)?)/);
  if (pctMatch) {
    const pct = parseFloat(pctMatch[1]);
    const val = parseFloat(pctMatch[2]);
    return `${pct}% of ${val} is ${(pct / 100) * val}, Sir.`;
  }
  const sqrtMatch = lower.match(/square\s+root\s+of\s+(\d+(?:\.\d+)?)/);
  if (sqrtMatch) {
    return `The square root of ${sqrtMatch[1]} is ${Math.sqrt(parseFloat(sqrtMatch[1])).toFixed(4)}, Sir.`;
  }
  const powMatch = lower.match(/(\d+)\s*(squared|cubed)/);
  if (powMatch) {
    const base = parseFloat(powMatch[1]);
    const exp = powMatch[2] === "squared" ? 2 : 3;
    return `${base} ${powMatch[2]} is ${Math.pow(base, exp)}, Sir.`;
  }
  const wordMatch = lower.match(/([\d.]+)\s*(plus|minus|times|multiplied\s+by|divided\s+by)\s*([\d.]+)/);
  if (wordMatch) {
    const a = parseFloat(wordMatch[1]);
    const b = parseFloat(wordMatch[3]);
    const op = wordMatch[2];
    let result: number, symbol: string;
    if (op === "plus") { result = a + b; symbol = "+"; }
    else if (op === "minus") { result = a - b; symbol = "-"; }
    else if (op === "times" || op.startsWith("multiplied")) { result = a * b; symbol = "×"; }
    else { result = b !== 0 ? a / b : NaN; symbol = "÷"; }
    if (isNaN(result)) return `Division by zero is undefined, Sir.`;
    return `${a} ${symbol} ${b} = ${Number.isInteger(result) ? result : result.toFixed(4)}, Sir.`;
  }
  return null;
}

function tryConversion(query: string): string | null {
  const lower = query.toLowerCase();
  const fToC = lower.match(/([\d.]+)\s*(?:°?\s*f|fahrenheit)\s*(?:to|in)\s*(?:°?\s*c|celsius)/);
  if (fToC) { const f = parseFloat(fToC[1]); return `${f}°F is ${((f - 32) * 5 / 9).toFixed(1)}°C, Sir.`; }
  const cToF = lower.match(/([\d.]+)\s*(?:°?\s*c|celsius)\s*(?:to|in)\s*(?:°?\s*f|fahrenheit)/);
  if (cToF) { const c = parseFloat(cToF[1]); return `${c}°C is ${(c * 9 / 5 + 32).toFixed(1)}°F, Sir.`; }
  const kgToLb = lower.match(/([\d.]+)\s*(?:kg|kilogram)/);
  if (kgToLb && (lower.includes("pound") || lower.includes("lb") || lower.includes("to"))) {
    return `${kgToLb[1]} kg is ${(parseFloat(kgToLb[1]) * 2.205).toFixed(1)} pounds, Sir.`;
  }
  const lbToKg = lower.match(/([\d.]+)\s*(?:lb|pound)/);
  if (lbToKg && (lower.includes("kg") || lower.includes("kilo") || lower.includes("to"))) {
    return `${lbToKg[1]} pounds is ${(parseFloat(lbToKg[1]) / 2.205).toFixed(1)} kg, Sir.`;
  }
  const miToKm = lower.match(/([\d.]+)\s*mile/);
  if (miToKm && (lower.includes("km") || lower.includes("kilo") || lower.includes("to"))) {
    return `${miToKm[1]} miles is ${(parseFloat(miToKm[1]) * 1.609).toFixed(1)} kilometers, Sir.`;
  }
  return null;
}

function tryTimeDate(query: string): string | null {
  const lower = query.toLowerCase();
  if (lower.match(/what\s+(time|day|date)|current\s+time|time\s+now|today's\s+date/)) {
    const now = new Date();
    return `It is currently ${now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} on ${now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}, Sir.`;
  }
  if (lower.match(/days?\s+(until|till|before)\s+/)) {
    const dateMatch = lower.match(/(?:until|till|before)\s+(.+?)(?:\?|$)/);
    if (dateMatch) {
      const now = new Date();
      const year = now.getFullYear();
      const holidays: Record<string, string> = {
        "christmas": `${year}-12-25`, "new year": `${year + 1}-01-01`,
        "valentine": `${year}-02-14`, "halloween": `${year}-10-31`,
        "thanksgiving": `${year}-11-28`, "easter": `${year}-04-20`,
      };
      for (const [name, date] of Object.entries(holidays)) {
        if (dateMatch[1].includes(name)) {
          const target = new Date(date);
          if (target < now) target.setFullYear(target.getFullYear() + 1);
          const days = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          return `There are ${days} days until ${name.charAt(0).toUpperCase() + name.slice(1)}, Sir.`;
        }
      }
    }
  }
  return null;
}

async function searchWikipedia(query: string): Promise<string | null> {
  try {
    const searchTerms = query.replace(/what\s+is|what\s+are|who\s+is|who\s+was|tell\s+me\s+about|explain|define|meaning\s+of|please|\?/gi, "").trim();
    if (searchTerms.length < 3) return null;
    const res = await fetchWithTimeout(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchTerms)}`, {}, 8000);
    if (res.ok) {
      const data = await res.json();
      if (data.extract && data.extract.length > 30) {
        const extract = data.extract.length > 500 ? data.extract.slice(0, 500).replace(/\.[^.]*$/, ".") : data.extract;
        return `${prefix()} Here's what I know:\n\n${extract}\n\nWould you like more details on this topic?`;
      }
    }
    const searchRes = await fetchWithTimeout(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchTerms)}&format=json&utf8=1&srlimit=1`, {}, 8000);
    if (searchRes.ok) {
      const searchData = await searchRes.json();
      const results = searchData?.query?.search;
      if (results?.length) {
        const summaryRes = await fetchWithTimeout(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(results[0].title)}`, {}, 8000);
        if (summaryRes.ok) {
          const summaryData = await summaryRes.json();
          if (summaryData.extract && summaryData.extract.length > 30) {
            const extract = summaryData.extract.length > 500 ? summaryData.extract.slice(0, 500).replace(/\.[^.]*$/, ".") : summaryData.extract;
            return `${prefix()} Based on my research:\n\n${extract}`;
          }
        }
      }
    }
    return null;
  } catch { return null; }
}

// ─── Main AI Response Generator ────────────────────────────────────────
export async function generateAIResponse(userMessage: string, _conversationHistory: { role: string; content: string }[] = []): Promise<string> {
  const query = userMessage.trim();
  const lower = query.toLowerCase();

  // 1. Weather
  if (lower.match(/weather|temperature\s+outside|how\s+(hot|cold|warm)|forecast/i)) {
    const weather = await getWeather(query);
    if (weather) return weather;
  }
  // 2. Math
  const math = tryMath(query);
  if (math) return math;
  // 3. Conversions
  const conversion = tryConversion(query);
  if (conversion) return conversion;
  // 4. Time/Date
  const timeDate = tryTimeDate(query);
  if (timeDate) return timeDate;
  // 5. Knowledge base
  const knowledge = matchKnowledge(query);
  if (knowledge) return knowledge;
  // 6. Wikipedia
  if (lower.match(/what\s+(is|are|was|were)|who\s+(is|was|are)|tell\s+me\s+about|explain|define|meaning|history\s+of|how\s+does|how\s+do|where\s+is|when\s+was|why\s+(is|do|does|are)/i)) {
    const wiki = await searchWikipedia(query);
    if (wiki) return wiki;
  }
  // 7. Greetings
  if (lower.match(/^(hello|hi|hey|good\s|greetings|howdy|yo|sup|what'?s up)/)) {
    return pick([`${getGreeting()} All systems online. How may I assist you?`, `${getGreeting()} A pleasure as always. What can I do for you?`, `${getGreeting()} Everything running smoothly. What's on your mind?`]);
  }
  // 8. Thanks
  if (lower.match(/thank|thanks|appreciate/)) {
    return pick(["Always a pleasure, Sir.", "You're most welcome, Sir.", "At your service, Sir."]);
  }
  // 9. Who are you
  if (lower.match(/who\s+are\s+you|your\s+name|what\s+are\s+you/)) {
    return "I am J.A.R.V.I.S. — Just A Rather Very Intelligent System. Your AI assistant with voice commands, smart home control, task management, and comprehensive knowledge across health, fitness, cooking, finance, relationships, career, technology, and much more. Ask me anything, Sir.";
  }
  // 10. Help
  if (lower.match(/what\s+can\s+you\s+do|^help$|^help me$|^help\s*\?|your\s+capabilities|list.*commands?/)) {
    return `${getGreeting()} I can help with:\n\n🌤️ Weather — "Weather in London"\n🧮 Math — "What is 15% of 230?"\n📐 Conversions — "Convert 100 kg to pounds"\n💪 Health & Fitness — diet, exercise, sleep, weight loss\n🍳 Cooking — recipes, meal prep, food storage\n💰 Finance — budgeting, investing, taxes\n💼 Career — interviews, resumes, negotiation\n❤️ Relationships — dating, friendships, communication\n🧠 Mental Health — stress, motivation, confidence\n🏠 Home — cleaning, organizing, maintenance\n📱 Technology — security, device tips\n📚 Learning — study tips, book recommendations\n🏠 Smart Home — "Turn on lights"\n📋 Tasks — "Create task: Buy groceries"\n\nJust ask naturally, Sir.`;
  }
  // 11. Goodbye
  if (lower.match(/goodbye|bye|good night|see you/)) {
    if (lower.includes("night")) return "Good night, Sir. Shall I activate the Good Night protocol?";
    return "Until next time, Sir. I'll keep watch.";
  }
  // 12. Jokes
  if (lower.match(/joke|funny|make me laugh/)) {
    return pick(["Why do programmers prefer dark mode? Because light attracts bugs, Sir.", "A SQL query walks into a bar, sees two tables, and asks: 'Can I join you?'", "Why did the developer go broke? He used up all his cache, Sir.", "There are 10 types of people: those who understand binary and those who don't."]);
  }
  // 13. Wikipedia fallback
  const wiki = await searchWikipedia(query);
  if (wiki) return wiki;
  // 14. Fallback
  return `${prefix()} That's an interesting question. While I don't have a specific answer for that, I can help with health, fitness, cooking, finance, career, relationships, technology, and much more. Could you rephrase or ask about one of these areas?`;
}

async function fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  try { return await fetch(url, { ...options, signal: controller.signal }); }
  finally { clearTimeout(timeoutId); }
}
