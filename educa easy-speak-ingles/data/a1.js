window.EASY_SPEAK_DATA = window.EASY_SPEAK_DATA || {};
window.EASY_SPEAK_DATA.A1 = [
  {
    "id": "A1-C01",
    "level": "A1",
    "emoji": "👋",
    "title": "Meeting someone",
    "topic": "Introductions",
    "estimatedMinutes": 2,
    "turns": [
      {
        "prompt": "Good morning! How are you today?",
        "options": [
          "I'm fine, thanks. And you?",
          "I'm good, thank you. How are you?",
          "I'm doing well today. How about you?"
        ],
        "keywords": [
          "i'm",
          "fine",
          "thanks",
          "good",
          "thank",
          "how",
          "doing",
          "well",
          "today"
        ],
        "tip": "",
        "id": "A1-C01-T01",
        "targetWords": 6,
        "everyday": "Hey, i'm fine, thanks. And you?",
        "reactive": false
      },
      {
        "prompt": "Nice! What's your name?",
        "options": [
          "My name is {{name}}.",
          "I’m {{name}}. Nice to meet you.",
          "You can call me {{name}}."
        ],
        "keywords": [
          "name",
          "call",
          "meet"
        ],
        "tip": "",
        "id": "A1-C01-T02",
        "targetWords": 5,
        "everyday": "I’m {{name}} — nice to meet you.",
        "reactive": true,
        "openAnswer": true
      },
      {
        "prompt": "Nice to meet you. Where are you from?",
        "options": [
          "I’m from {{country}}.",
          "I live in {{city}}, in {{country}}.",
          "I’m from {{country}}, and I live in {{city}}."
        ],
        "keywords": [
          "from",
          "live"
        ],
        "tip": "",
        "id": "A1-C01-T03",
        "targetWords": 4,
        "everyday": "I’m from {{country}}. I live in {{city}}.",
        "reactive": false,
        "openAnswer": true
      },
      {
        "prompt": "What do you do?",
        "options": [
          "I work as {{role}}.",
          "I’m {{role}}.",
          "I work as {{role}}, and I enjoy it."
        ],
        "keywords": [
          "work",
          "study",
          "job"
        ],
        "tip": "",
        "id": "A1-C01-T04",
        "targetWords": 5,
        "everyday": "I’m in {{role}} — that’s what I do.",
        "reactive": true,
        "openAnswer": true
      },
      {
        "prompt": "It was nice talking to you. What can you say before you go?",
        "options": [
          "Nice to meet you. See you soon!",
          "It was nice talking to you. Goodbye!",
          "Have a nice day. See you later!"
        ],
        "keywords": [
          "nice",
          "meet",
          "see",
          "soon",
          "talking",
          "goodbye",
          "day",
          "later"
        ],
        "tip": "",
        "id": "A1-C01-T05",
        "targetWords": 7,
        "everyday": "Personally, nice to meet you. See you soon!",
        "reactive": false
      }
    ],
    "canDo": "Exchange basic greetings and personal information",
    "functions": [
      "greet",
      "introduce"
    ],
    "cefrFocus": "Spoken interaction and production"
  },
  {
    "id": "A1-C02",
    "level": "A1",
    "emoji": "👨‍👩‍👧",
    "title": "Talking about family",
    "topic": "Family",
    "estimatedMinutes": 2,
    "turns": [
      {
        "prompt": "Do you have a big family?",
        "options": [
          "Yes, I have a big family.",
          "My family is quite big.",
          "Yes, there are several people in my family."
        ],
        "keywords": [
          "yes",
          "big",
          "family",
          "quite",
          "there",
          "several",
          "people"
        ],
        "tip": "",
        "id": "A1-C02-T01",
        "targetWords": 6,
        "everyday": "There are several people in my family.",
        "reactive": false
      },
      {
        "prompt": "Who do you live with?",
        "options": [
          "I live with my family.",
          "I live with my children.",
          "I live at home with my family."
        ],
        "keywords": [
          "live",
          "family",
          "children",
          "home"
        ],
        "tip": "",
        "id": "A1-C02-T02",
        "targetWords": 6,
        "everyday": "Personally, i live with my family.",
        "reactive": true
      },
      {
        "prompt": "Do you have any brothers or sisters?",
        "options": [
          "Yes, I have a sister.",
          "Yes, I have brothers and sisters.",
          "No, I don't have any brothers or sisters."
        ],
        "keywords": [
          "yes",
          "sister",
          "brothers",
          "sisters",
          "don't",
          "any"
        ],
        "tip": "",
        "id": "A1-C02-T03",
        "targetWords": 6,
        "everyday": "I’ve brothers and sisters.",
        "reactive": false
      },
      {
        "prompt": "What do you like doing with your family?",
        "options": [
          "We like having lunch together.",
          "We like talking and spending time together.",
          "We enjoy going out together."
        ],
        "keywords": [
          "like",
          "having",
          "lunch",
          "together",
          "talking",
          "spending",
          "time",
          "enjoy",
          "going",
          "out"
        ],
        "tip": "",
        "id": "A1-C02-T04",
        "targetWords": 6,
        "everyday": "Personally, we like having lunch together.",
        "reactive": true
      },
      {
        "prompt": "Tell me one thing you like about your family.",
        "options": [
          "They are kind and supportive.",
          "I like that we help each other.",
          "I love spending time with them."
        ],
        "keywords": [
          "kind",
          "supportive",
          "like",
          "help",
          "each",
          "other",
          "love",
          "spending",
          "time",
          "them"
        ],
        "tip": "",
        "id": "A1-C02-T05",
        "targetWords": 6,
        "everyday": "Personally, they are kind and supportive.",
        "reactive": false
      }
    ],
    "canDo": "Talk simply about family members",
    "functions": [
      "describe",
      "family"
    ],
    "cefrFocus": "Spoken interaction and production"
  },
  {
    "id": "A1-C03",
    "level": "A1",
    "emoji": "☀️",
    "title": "My daily routine",
    "topic": "Daily life",
    "estimatedMinutes": 2,
    "turns": [
      {
        "prompt": "What time do you usually get up?",
        "options": [
          "I usually get up at six.",
          "I get up early, at about six.",
          "I normally wake up around six in the morning."
        ],
        "keywords": [
          "usually",
          "get",
          "six",
          "early",
          "normally",
          "wake",
          "around",
          "morning"
        ],
        "tip": "",
        "id": "A1-C03-T01",
        "targetWords": 7,
        "everyday": "Personally, i usually get up at six.",
        "reactive": false
      },
      {
        "prompt": "What do you do first in the morning?",
        "options": [
          "I take a shower.",
          "First, I have breakfast.",
          "I get ready and then I have breakfast."
        ],
        "keywords": [
          "take",
          "shower",
          "first",
          "breakfast",
          "get",
          "ready",
          "then"
        ],
        "tip": "",
        "id": "A1-C03-T02",
        "targetWords": 5,
        "everyday": "I get ready and then I’ve breakfast.",
        "reactive": true
      },
      {
        "prompt": "How do you go to work or study?",
        "options": [
          "I usually go by car.",
          "I go by bus.",
          "I normally walk to work."
        ],
        "keywords": [
          "usually",
          "car",
          "bus",
          "normally",
          "walk",
          "work"
        ],
        "tip": "",
        "id": "A1-C03-T03",
        "targetWords": 5,
        "everyday": "Personally, i usually go by car.",
        "reactive": false
      },
      {
        "prompt": "What do you do in the afternoon?",
        "options": [
          "I work in the afternoon.",
          "I usually study or work.",
          "In the afternoon, I finish my daily tasks."
        ],
        "keywords": [
          "work",
          "afternoon",
          "usually",
          "study",
          "finish",
          "daily",
          "tasks"
        ],
        "tip": "",
        "id": "A1-C03-T04",
        "targetWords": 6,
        "everyday": "Personally, i work in the afternoon.",
        "reactive": true
      },
      {
        "prompt": "What do you do before you go to bed?",
        "options": [
          "I read for a few minutes.",
          "I relax and then go to bed.",
          "I usually prepare things for the next day."
        ],
        "keywords": [
          "read",
          "few",
          "minutes",
          "relax",
          "then",
          "bed",
          "usually",
          "prepare",
          "things",
          "next"
        ],
        "tip": "",
        "id": "A1-C03-T05",
        "targetWords": 7,
        "everyday": "Personally, i read for a few minutes.",
        "reactive": false
      }
    ],
    "canDo": "Describe a simple daily routine",
    "functions": [
      "routine",
      "time"
    ],
    "cefrFocus": "Spoken interaction and production"
  },
  {
    "id": "A1-C04",
    "level": "A1",
    "emoji": "🍲",
    "title": "Food I like",
    "topic": "Food",
    "estimatedMinutes": 2,
    "turns": [
      {
        "prompt": "What's your favourite food?",
        "options": [
          "My favourite food is fish.",
          "I really like chicken and rice.",
          "I love simple homemade food."
        ],
        "keywords": [
          "favourite",
          "food",
          "fish",
          "like",
          "chicken",
          "rice",
          "love",
          "simple",
          "homemade"
        ],
        "tip": "",
        "id": "A1-C04-T01",
        "targetWords": 5,
        "everyday": "Personally, my favourite food is fish.",
        "reactive": false
      },
      {
        "prompt": "What do you usually have for breakfast?",
        "options": [
          "I usually have eggs and bread.",
          "I have fruit and coffee for breakfast.",
          "I normally eat a light breakfast."
        ],
        "keywords": [
          "usually",
          "eggs",
          "bread",
          "fruit",
          "coffee",
          "breakfast",
          "normally",
          "eat",
          "light"
        ],
        "tip": "",
        "id": "A1-C04-T02",
        "targetWords": 6,
        "everyday": "I’ve fruit and coffee for breakfast.",
        "reactive": true
      },
      {
        "prompt": "Can you cook?",
        "options": [
          "Yes, I can cook simple meals.",
          "Yes, I like cooking at home.",
          "A little. I can prepare a few dishes."
        ],
        "keywords": [
          "yes",
          "cook",
          "simple",
          "meals",
          "like",
          "cooking",
          "home",
          "little",
          "prepare",
          "few"
        ],
        "tip": "",
        "id": "A1-C04-T03",
        "targetWords": 7,
        "everyday": "I can cook simple meals.",
        "reactive": false
      },
      {
        "prompt": "Do you prefer eating at home or at a restaurant?",
        "options": [
          "I prefer eating at home.",
          "I like restaurants, but I usually eat at home.",
          "I prefer homemade food because it's simple."
        ],
        "keywords": [
          "prefer",
          "eating",
          "home",
          "like",
          "restaurants",
          "usually",
          "eat",
          "homemade",
          "food",
          "because"
        ],
        "tip": "",
        "id": "A1-C04-T04",
        "targetWords": 7,
        "everyday": "I’d rather eating at home.",
        "reactive": true
      },
      {
        "prompt": "What would you like to eat today?",
        "options": [
          "I'd like some fish and vegetables.",
          "I'd like a light meal today.",
          "I think I'd like chicken with salad."
        ],
        "keywords": [
          "i'd",
          "like",
          "some",
          "fish",
          "vegetables",
          "light",
          "meal",
          "today",
          "think",
          "chicken"
        ],
        "tip": "",
        "id": "A1-C04-T05",
        "targetWords": 6,
        "everyday": "Personally, i'd like some fish and vegetables.",
        "reactive": false
      }
    ],
    "canDo": "Say what food you like and make a simple choice",
    "functions": [
      "preferences",
      "food"
    ],
    "cefrFocus": "Spoken interaction and production"
  },
  {
    "id": "A1-C05",
    "level": "A1",
    "emoji": "🏠",
    "title": "My home",
    "topic": "Home",
    "estimatedMinutes": 2,
    "turns": [
      {
        "prompt": "Do you live in a house or an apartment?",
        "options": [
          "I live in a house.",
          "I live in an apartment.",
          "I live in a small house."
        ],
        "keywords": [
          "live",
          "house",
          "apartment",
          "small"
        ],
        "tip": "",
        "id": "A1-C05-T01",
        "targetWords": 5,
        "everyday": "Personally, i live in a house.",
        "reactive": false
      },
      {
        "prompt": "What's your favourite room?",
        "options": [
          "My favourite room is the living room.",
          "I like my bedroom most.",
          "I really like the kitchen."
        ],
        "keywords": [
          "favourite",
          "room",
          "living",
          "like",
          "bedroom",
          "most",
          "kitchen"
        ],
        "tip": "",
        "id": "A1-C05-T02",
        "targetWords": 6,
        "everyday": "Personally, my favourite room is the living room.",
        "reactive": true
      },
      {
        "prompt": "What is in your living room?",
        "options": [
          "There is a sofa and a television.",
          "There are some chairs and a table.",
          "There is a sofa, a table and some plants."
        ],
        "keywords": [
          "there",
          "sofa",
          "television",
          "some",
          "chairs",
          "table",
          "plants"
        ],
        "tip": "",
        "id": "A1-C05-T03",
        "targetWords": 8,
        "everyday": "Personally, there is a sofa and a television.",
        "reactive": false
      },
      {
        "prompt": "Do you have a quiet place at home?",
        "options": [
          "Yes, my bedroom is quiet.",
          "Yes, I have a quiet place to work.",
          "I usually relax in a quiet room."
        ],
        "keywords": [
          "yes",
          "bedroom",
          "quiet",
          "place",
          "work",
          "usually",
          "relax",
          "room"
        ],
        "tip": "",
        "id": "A1-C05-T04",
        "targetWords": 7,
        "everyday": "My bedroom is quiet.",
        "reactive": true
      },
      {
        "prompt": "What do you like about your home?",
        "options": [
          "It's comfortable and quiet.",
          "I like that it feels peaceful.",
          "I like spending time there with my family."
        ],
        "keywords": [
          "it's",
          "comfortable",
          "quiet",
          "like",
          "feels",
          "peaceful",
          "spending",
          "time",
          "there",
          "family"
        ],
        "tip": "",
        "id": "A1-C05-T05",
        "targetWords": 6,
        "everyday": "Personally, it's comfortable and quiet.",
        "reactive": false
      }
    ],
    "canDo": "Describe your home in simple language",
    "functions": [
      "describe",
      "home"
    ],
    "cefrFocus": "Spoken interaction and production"
  },
  {
    "id": "A1-C06",
    "level": "A1",
    "emoji": "🌆",
    "title": "My city",
    "topic": "Places",
    "estimatedMinutes": 2,
    "turns": [
      {
        "prompt": "What city do you live in?",
        "options": [
          "I live in {{city}}.",
          "I live in {{city}}, in {{country}}.",
          "My city is {{city}}."
        ],
        "keywords": [
          "live",
          "city",
          "based"
        ],
        "tip": "",
        "id": "A1-C06-T01",
        "targetWords": 6,
        "everyday": "I’m based in {{city}}.",
        "reactive": false,
        "openAnswer": true
      },
      {
        "prompt": "Is your city big or small?",
        "options": [
          "It’s a medium-sized city.",
          "It’s not very big.",
          "It’s smaller than a major city, but it has everything I need."
        ],
        "keywords": [
          "it's",
          "medium",
          "sized",
          "city",
          "not",
          "big",
          "smaller",
          "than",
          "largest",
          "cities"
        ],
        "tip": "",
        "id": "A1-C06-T02",
        "targetWords": 5,
        "everyday": "Personally, it’s a medium-sized city.",
        "reactive": true
      },
      {
        "prompt": "What's a nice place in your city?",
        "options": [
          "There are beautiful parks.",
          "I like the city centre.",
          "There are nice places to walk and have coffee."
        ],
        "keywords": [
          "there",
          "beautiful",
          "parks",
          "like",
          "city",
          "centre",
          "nice",
          "places",
          "walk",
          "coffee"
        ],
        "tip": "",
        "id": "A1-C06-T03",
        "targetWords": 6,
        "everyday": "Personally, there are beautiful parks.",
        "reactive": false
      },
      {
        "prompt": "How is the weather there?",
        "options": [
          "It's usually warm and pleasant.",
          "The weather changes during the day.",
          "It's often mild, with some rain."
        ],
        "keywords": [
          "it's",
          "usually",
          "warm",
          "pleasant",
          "weather",
          "changes",
          "during",
          "day",
          "often",
          "mild"
        ],
        "tip": "",
        "id": "A1-C06-T04",
        "targetWords": 6,
        "everyday": "Personally, it's usually warm and pleasant.",
        "reactive": true
      },
      {
        "prompt": "What do you like most about your city?",
        "options": [
          "I like the people and the weather.",
          "I like that many places are nearby.",
          "I enjoy the green landscape around the city."
        ],
        "keywords": [
          "like",
          "people",
          "weather",
          "many",
          "places",
          "nearby",
          "enjoy",
          "green",
          "landscape",
          "around"
        ],
        "tip": "",
        "id": "A1-C06-T05",
        "targetWords": 7,
        "everyday": "Personally, i like the people and the weather.",
        "reactive": false
      }
    ],
    "canDo": "Say where you live and describe a few places",
    "functions": [
      "places",
      "describe"
    ],
    "cefrFocus": "Spoken interaction and production"
  },
  {
    "id": "A1-C07",
    "level": "A1",
    "emoji": "🎧",
    "title": "Free time and hobbies",
    "topic": "Hobbies",
    "estimatedMinutes": 2,
    "turns": [
      {
        "prompt": "What do you like doing in your free time?",
        "options": [
          "I like reading.",
          "I enjoy listening to music.",
          "I like walking and spending time with my family."
        ],
        "keywords": [
          "like",
          "reading",
          "enjoy",
          "listening",
          "music",
          "walking",
          "spending",
          "time",
          "family"
        ],
        "tip": "",
        "id": "A1-C07-T01",
        "targetWords": 6,
        "everyday": "Personally, i like reading.",
        "reactive": false
      },
      {
        "prompt": "Do you like watching movies?",
        "options": [
          "Yes, I like movies.",
          "Yes, I watch movies at home.",
          "Sometimes. I enjoy a good movie."
        ],
        "keywords": [
          "yes",
          "like",
          "movies",
          "watch",
          "home",
          "sometimes",
          "enjoy",
          "good",
          "movie"
        ],
        "tip": "",
        "id": "A1-C07-T02",
        "targetWords": 5,
        "everyday": "I watch movies at home.",
        "reactive": true
      },
      {
        "prompt": "What kind of music do you like?",
        "options": [
          "I like different kinds of music.",
          "I enjoy relaxing music.",
          "I usually listen to music that helps me relax."
        ],
        "keywords": [
          "like",
          "different",
          "kinds",
          "music",
          "enjoy",
          "relaxing",
          "usually",
          "listen",
          "helps",
          "relax"
        ],
        "tip": "",
        "id": "A1-C07-T03",
        "targetWords": 6,
        "everyday": "Personally, i like different kinds of music.",
        "reactive": false
      },
      {
        "prompt": "Do you do any exercise?",
        "options": [
          "Yes, I like walking.",
          "I sometimes do yoga.",
          "Yes, I try to stay active."
        ],
        "keywords": [
          "yes",
          "like",
          "walking",
          "sometimes",
          "yoga",
          "try",
          "stay",
          "active"
        ],
        "tip": "",
        "id": "A1-C07-T04",
        "targetWords": 5,
        "everyday": "Yeah, I like walking.",
        "reactive": true
      },
      {
        "prompt": "What would you like to do this weekend?",
        "options": [
          "I'd like to rest and read.",
          "I'd like to go for a walk.",
          "I want to spend time with my family."
        ],
        "keywords": [
          "i'd",
          "like",
          "rest",
          "read",
          "walk",
          "want",
          "spend",
          "time",
          "family"
        ],
        "tip": "",
        "id": "A1-C07-T05",
        "targetWords": 7,
        "everyday": "Personally, i'd like to rest and read.",
        "reactive": false
      }
    ],
    "canDo": "Talk about hobbies and free-time preferences",
    "functions": [
      "hobbies",
      "preferences"
    ],
    "cefrFocus": "Spoken interaction and production"
  },
  {
    "id": "A1-C08",
    "level": "A1",
    "emoji": "🛍️",
    "title": "Buying something",
    "topic": "Shopping",
    "estimatedMinutes": 2,
    "turns": [
      {
        "prompt": "Hello! Can I help you?",
        "options": [
          "Yes, please. I'm looking for a shirt.",
          "Yes, I'd like to buy a T-shirt.",
          "Yes, please. I need a new shirt."
        ],
        "keywords": [
          "yes",
          "please",
          "i'm",
          "looking",
          "shirt",
          "i'd",
          "like",
          "buy",
          "need",
          "new"
        ],
        "tip": "",
        "id": "A1-C08-T01",
        "targetWords": 7,
        "everyday": "Please. I need a new shirt.",
        "reactive": false
      },
      {
        "prompt": "What colour would you like?",
        "options": [
          "I'd like a blue one.",
          "Blue, please.",
          "I think I'd like it in blue."
        ],
        "keywords": [
          "i'd",
          "like",
          "blue",
          "one",
          "please",
          "think"
        ],
        "tip": "",
        "id": "A1-C08-T02",
        "targetWords": 5,
        "everyday": "Personally, i'd like a blue one.",
        "reactive": true
      },
      {
        "prompt": "What size do you need?",
        "options": [
          "I need a medium, please.",
          "Medium, please.",
          "I usually wear a medium."
        ],
        "keywords": [
          "need",
          "medium",
          "please",
          "usually",
          "wear"
        ],
        "tip": "",
        "id": "A1-C08-T03",
        "targetWords": 4,
        "everyday": "Personally, i need a medium, please.",
        "reactive": false
      },
      {
        "prompt": "Would you like to try it on?",
        "options": [
          "Yes, please. Where is the changing room?",
          "Yes, I'd like to try it on.",
          "Yes, please. Can I try this one?"
        ],
        "keywords": [
          "yes",
          "please",
          "where",
          "changing",
          "room",
          "i'd",
          "like",
          "try",
          "one"
        ],
        "tip": "",
        "id": "A1-C08-T04",
        "targetWords": 7,
        "everyday": "Please. Can I try this one?",
        "reactive": true
      },
      {
        "prompt": "Do you want to buy it?",
        "options": [
          "Yes, I'll take it. Thank you.",
          "Yes, please. How much is it?",
          "I like it. I'd like to buy it."
        ],
        "keywords": [
          "yes",
          "i'll",
          "take",
          "thank",
          "please",
          "how",
          "much",
          "like",
          "i'd",
          "buy"
        ],
        "tip": "",
        "id": "A1-C08-T05",
        "targetWords": 7,
        "everyday": "Yeah, I'll take it. Thanks.",
        "reactive": false
      }
    ],
    "canDo": "Ask for and respond to simple shopping information",
    "functions": [
      "shopping",
      "transaction"
    ],
    "cefrFocus": "Spoken interaction and production"
  },
  {
    "id": "A1-C09",
    "level": "A1",
    "emoji": "🌦️",
    "title": "Talking about the weather",
    "topic": "Weather",
    "estimatedMinutes": 2,
    "turns": [
      {
        "prompt": "What's the weather like today?",
        "options": [
          "It's warm and sunny.",
          "It's a little cloudy today.",
          "It's cool and it might rain."
        ],
        "keywords": [
          "it's",
          "warm",
          "sunny",
          "little",
          "cloudy",
          "today",
          "cool",
          "might",
          "rain"
        ],
        "tip": "",
        "id": "A1-C09-T01",
        "targetWords": 5,
        "everyday": "Personally, it's warm and sunny.",
        "reactive": false
      },
      {
        "prompt": "Do you like hot weather?",
        "options": [
          "Yes, I like warm weather.",
          "Not very much. I prefer mild weather.",
          "I like warm days, but not extreme heat."
        ],
        "keywords": [
          "yes",
          "like",
          "warm",
          "weather",
          "not",
          "much",
          "prefer",
          "mild",
          "days",
          "extreme"
        ],
        "tip": "",
        "id": "A1-C09-T02",
        "targetWords": 7,
        "everyday": "I like warm weather.",
        "reactive": true
      },
      {
        "prompt": "What do you do when it rains?",
        "options": [
          "I usually stay at home.",
          "I take an umbrella when I go out.",
          "I like reading or watching a movie at home."
        ],
        "keywords": [
          "usually",
          "stay",
          "home",
          "take",
          "umbrella",
          "when",
          "out",
          "like",
          "reading",
          "watching"
        ],
        "tip": "",
        "id": "A1-C09-T03",
        "targetWords": 7,
        "everyday": "Personally, i usually stay at home.",
        "reactive": false
      },
      {
        "prompt": "What's your favourite season?",
        "options": [
          "I like spring.",
          "I prefer the warmer months.",
          "I like seasons with mild weather."
        ],
        "keywords": [
          "like",
          "spring",
          "prefer",
          "warmer",
          "months",
          "seasons",
          "mild",
          "weather"
        ],
        "tip": "",
        "id": "A1-C09-T04",
        "targetWords": 5,
        "everyday": "I’d rather the warmer months.",
        "reactive": true
      },
      {
        "prompt": "What will you do if it rains later?",
        "options": [
          "I'll take an umbrella.",
          "I'll stay inside for a while.",
          "I'll change my plans and do something indoors."
        ],
        "keywords": [
          "i'll",
          "take",
          "umbrella",
          "stay",
          "inside",
          "while",
          "change",
          "plans",
          "something",
          "indoors"
        ],
        "tip": "",
        "id": "A1-C09-T05",
        "targetWords": 6,
        "everyday": "Personally, i'll take an umbrella.",
        "reactive": false
      }
    ],
    "canDo": "Exchange simple information about weather",
    "functions": [
      "weather",
      "small talk"
    ],
    "cefrFocus": "Spoken interaction and production"
  },
  {
    "id": "A1-C10",
    "level": "A1",
    "emoji": "📅",
    "title": "Weekend plans",
    "topic": "Plans",
    "estimatedMinutes": 2,
    "turns": [
      {
        "prompt": "What are you doing this weekend?",
        "options": [
          "I'm going to rest at home.",
          "I'm going to spend time with my family.",
          "I have a few plans, but I also want to relax."
        ],
        "keywords": [
          "i'm",
          "going",
          "rest",
          "home",
          "spend",
          "time",
          "family",
          "few",
          "plans",
          "also"
        ],
        "tip": "",
        "id": "A1-C10-T01",
        "targetWords": 8,
        "everyday": "I’ve a few plans, but I also want to relax.",
        "reactive": false
      },
      {
        "prompt": "Are you going out on Saturday?",
        "options": [
          "Yes, I'm going out in the afternoon.",
          "Maybe. I might go for a walk.",
          "No, I think I'll stay at home."
        ],
        "keywords": [
          "yes",
          "i'm",
          "going",
          "out",
          "afternoon",
          "maybe",
          "might",
          "walk",
          "think",
          "i'll"
        ],
        "tip": "",
        "id": "A1-C10-T02",
        "targetWords": 7,
        "everyday": "I'm going out in the afternoon.",
        "reactive": true
      },
      {
        "prompt": "Who will you spend time with?",
        "options": [
          "I'll spend time with my family.",
          "I'm meeting a friend.",
          "I'll probably be with my children."
        ],
        "keywords": [
          "i'll",
          "spend",
          "time",
          "family",
          "i'm",
          "meeting",
          "friend",
          "probably",
          "children"
        ],
        "tip": "",
        "id": "A1-C10-T03",
        "targetWords": 5,
        "everyday": "Personally, i'll spend time with my family.",
        "reactive": false
      },
      {
        "prompt": "Would you like to eat somewhere nice?",
        "options": [
          "Yes, I'd like to try a nice restaurant.",
          "Maybe. I'd like to have lunch outside.",
          "Yes, that sounds good."
        ],
        "keywords": [
          "yes",
          "i'd",
          "like",
          "try",
          "nice",
          "restaurant",
          "maybe",
          "lunch",
          "outside",
          "sounds"
        ],
        "tip": "",
        "id": "A1-C10-T04",
        "targetWords": 6,
        "everyday": "Yeah, I'd like to try a nice restaurant.",
        "reactive": true
      },
      {
        "prompt": "What would make it a good weekend?",
        "options": [
          "Resting and having time with my family.",
          "A quiet weekend would be perfect.",
          "I'd like to relax and do something enjoyable."
        ],
        "keywords": [
          "resting",
          "having",
          "time",
          "family",
          "quiet",
          "weekend",
          "perfect",
          "i'd",
          "like",
          "relax"
        ],
        "tip": "",
        "id": "A1-C10-T05",
        "targetWords": 7,
        "everyday": "Personally, resting and having time with my family.",
        "reactive": false
      }
    ],
    "canDo": "Say what you plan to do at the weekend",
    "functions": [
      "plans",
      "future"
    ],
    "cefrFocus": "Spoken interaction and production"
  },
{
  "id": "A1-C11",
  "level": "A1",
  "emoji": "🙋",
  "title": "Asking for help in a shop",
  "topic": "Public services",
  "estimatedMinutes": 2,
  "canDo": "Ask for simple help and directions inside a shop",
  "functions": [
    "requests",
    "directions"
  ],
  "cefrFocus": "Spoken interaction and production",
  "turns": [
    {
      "prompt": "Hello! Are you looking for something?",
      "options": [
        "Yes, please. Where are the bags?",
        "Yes, can you help me, please?",
        "Yes, I'm looking for the toilets."
      ],
      "keywords": [
        "yes",
        "please",
        "where",
        "are",
        "the",
        "bags",
        "can",
        "you",
        "help",
        "me",
        "i'm",
        "looking"
      ],
      "tip": "",
      "id": "A1-C11-T01",
      "targetWords": 6,
      "everyday": "Just looking for the bags, please.",
      "reactive": false
    },
    {
      "prompt": "Sure. It's over there, on the left.",
      "options": [
        "Thank you very much.",
        "Thanks a lot.",
        "Oh, thank you!"
      ],
      "keywords": [
        "thank",
        "you",
        "very",
        "much",
        "thanks",
        "a",
        "lot",
        "oh"
      ],
      "tip": "",
      "id": "A1-C11-T02",
      "targetWords": 4,
      "everyday": "Great, thanks!",
      "reactive": true
    },
    {
      "prompt": "Do you need anything else?",
      "options": [
        "No, that's all, thanks.",
        "Yes, one more thing, please.",
        "No, I'm fine, thank you."
      ],
      "keywords": [
        "no",
        "that's",
        "all",
        "thanks",
        "yes",
        "one",
        "more",
        "thing",
        "please",
        "i'm",
        "fine",
        "thank"
      ],
      "tip": "",
      "id": "A1-C11-T03",
      "targetWords": 5,
      "everyday": "Nope, that's everything.",
      "reactive": false
    },
    {
      "prompt": "Is this your first time in this shop?",
      "options": [
        "Yes, it's my first time here.",
        "No, I come here sometimes.",
        "No, I often come here."
      ],
      "keywords": [
        "yes",
        "it's",
        "my",
        "first",
        "time",
        "here",
        "no",
        "i",
        "come",
        "sometimes",
        "often"
      ],
      "tip": "",
      "id": "A1-C11-T04",
      "targetWords": 6,
      "everyday": "Nah, I come here quite a bit.",
      "reactive": false,
      "openAnswer": true
    },
    {
      "prompt": "Have a nice day!",
      "options": [
        "Thank you, you too!",
        "Thanks, bye!",
        "You too, goodbye!"
      ],
      "keywords": [
        "thank",
        "you",
        "too",
        "thanks",
        "bye",
        "goodbye"
      ],
      "tip": "",
      "id": "A1-C11-T05",
      "targetWords": 5,
      "everyday": "Cheers, bye!",
      "reactive": false
    }
  ]
},
{
  "id": "A1-C12",
  "level": "A1",
  "emoji": "📚",
  "title": "My English class",
  "topic": "Learning",
  "estimatedMinutes": 2,
  "canDo": "Talk simply about a class and how you feel about learning",
  "functions": [
    "education",
    "preferences"
  ],
  "cefrFocus": "Spoken interaction and production",
  "turns": [
    {
      "prompt": "Do you go to an English class?",
      "options": [
        "Yes, I go to a class every week.",
        "Yes, I study English online.",
        "No, I study by myself at home."
      ],
      "keywords": [
        "yes",
        "i",
        "go",
        "to",
        "a",
        "class",
        "every",
        "week",
        "study",
        "english",
        "online",
        "no"
      ],
      "tip": "",
      "id": "A1-C12-T01",
      "targetWords": 6,
      "everyday": "Yeah, I do a bit of English online.",
      "reactive": false,
      "openAnswer": true
    },
    {
      "prompt": "What do you like about learning English?",
      "options": [
        "I like speaking with new people.",
        "I like learning new words.",
        "I like watching English films."
      ],
      "keywords": [
        "i",
        "like",
        "speaking",
        "with",
        "new",
        "people",
        "learning",
        "words",
        "watching",
        "english",
        "films"
      ],
      "tip": "",
      "id": "A1-C12-T02",
      "targetWords": 6,
      "everyday": "Mostly picking up new words, I guess.",
      "reactive": true,
      "openAnswer": true
    },
    {
      "prompt": "Is speaking easy or difficult for you?",
      "options": [
        "Speaking is a bit difficult for me.",
        "Speaking is easy for me now.",
        "Speaking is difficult, but I practise."
      ],
      "keywords": [
        "speaking",
        "is",
        "a",
        "bit",
        "difficult",
        "for",
        "me",
        "easy",
        "now",
        "but",
        "i",
        "practise"
      ],
      "tip": "",
      "id": "A1-C12-T03",
      "targetWords": 6,
      "everyday": "Honestly, speaking's the tricky part.",
      "reactive": false,
      "openAnswer": true
    },
    {
      "prompt": "How often do you practise speaking?",
      "options": [
        "I practise every day.",
        "I practise two or three times a week.",
        "I don't practise very often."
      ],
      "keywords": [
        "i",
        "practise",
        "every",
        "day",
        "two",
        "or",
        "three",
        "times",
        "a",
        "week",
        "don't",
        "very"
      ],
      "tip": "",
      "id": "A1-C12-T04",
      "targetWords": 6,
      "everyday": "Pretty much every day.",
      "reactive": false,
      "openAnswer": true
    },
    {
      "prompt": "What do you want to say better in English?",
      "options": [
        "I want to speak more quickly.",
        "I want to talk about my job.",
        "I want to understand people better."
      ],
      "keywords": [
        "i",
        "want",
        "to",
        "speak",
        "more",
        "quickly",
        "talk",
        "about",
        "my",
        "job",
        "understand",
        "people"
      ],
      "tip": "",
      "id": "A1-C12-T05",
      "targetWords": 6,
      "everyday": "Mainly just speak faster, really.",
      "reactive": true,
      "openAnswer": true
    }
  ]
},
{
  "id": "A1-C13",
  "level": "A1",
  "emoji": "🧰",
  "title": "A day at work",
  "topic": "Work",
  "estimatedMinutes": 2,
  "canDo": "Describe a simple work day and basic daily tasks",
  "functions": [
    "work",
    "daily routine"
  ],
  "cefrFocus": "Spoken interaction and production",
  "turns": [
    {
      "prompt": "What time do you start work?",
      "options": [
        "I start at nine o'clock.",
        "I start work at eight.",
        "I usually start in the morning."
      ],
      "keywords": [
        "i",
        "start",
        "at",
        "nine",
        "o'clock",
        "work",
        "eight",
        "usually",
        "in",
        "the",
        "morning"
      ],
      "tip": "",
      "id": "A1-C13-T01",
      "targetWords": 5,
      "everyday": "Nine-ish, usually.",
      "reactive": false,
      "openAnswer": true
    },
    {
      "prompt": "What do you do at work?",
      "options": [
        "I work as {{role}}.",
        "I answer emails and calls.",
        "I talk to people and help them."
      ],
      "keywords": [
        "i",
        "work",
        "as",
        "role",
        "answer",
        "emails",
        "and",
        "calls",
        "talk",
        "to",
        "people",
        "help"
      ],
      "tip": "",
      "id": "A1-C13-T02",
      "targetWords": 6,
      "everyday": "I'm {{role}}, basically.",
      "reactive": true,
      "openAnswer": true
    },
    {
      "prompt": "Do you work with other people?",
      "options": [
        "Yes, I work with a small team.",
        "Yes, I work with many people.",
        "No, I usually work alone."
      ],
      "keywords": [
        "yes",
        "i",
        "work",
        "with",
        "a",
        "small",
        "team",
        "many",
        "people",
        "no",
        "usually",
        "alone"
      ],
      "tip": "",
      "id": "A1-C13-T03",
      "targetWords": 6,
      "everyday": "Yeah, small team, just a few of us.",
      "reactive": false,
      "openAnswer": true
    },
    {
      "prompt": "What is difficult about your work day?",
      "options": [
        "Sometimes I have too many tasks.",
        "The mornings are very busy.",
        "It's difficult to finish everything."
      ],
      "keywords": [
        "sometimes",
        "i",
        "have",
        "too",
        "many",
        "tasks",
        "the",
        "mornings",
        "are",
        "very",
        "busy",
        "it's"
      ],
      "tip": "",
      "id": "A1-C13-T04",
      "targetWords": 6,
      "everyday": "Too much on some days, honestly.",
      "reactive": false,
      "openAnswer": true
    },
    {
      "prompt": "What time do you finish work?",
      "options": [
        "I finish at five o'clock.",
        "I usually finish in the evening.",
        "I finish work at six."
      ],
      "keywords": [
        "i",
        "finish",
        "at",
        "five",
        "o'clock",
        "usually",
        "in",
        "the",
        "evening",
        "work",
        "six"
      ],
      "tip": "",
      "id": "A1-C13-T05",
      "targetWords": 5,
      "everyday": "Around five, most days.",
      "reactive": false,
      "openAnswer": true
    }
  ]
},
{
  "id": "A1-C14",
  "level": "A1",
  "emoji": "🧑‍🤝‍🧑",
  "title": "Talking about a friend",
  "topic": "Relationships",
  "estimatedMinutes": 2,
  "canDo": "Describe a friend using simple language",
  "functions": [
    "describing people",
    "relationships"
  ],
  "cefrFocus": "Spoken interaction and production",
  "turns": [
    {
      "prompt": "Do you have a good friend?",
      "options": [
        "Yes, I have a good friend.",
        "Yes, I have a few close friends.",
        "Yes, my best friend is very important to me."
      ],
      "keywords": [
        "yes",
        "i",
        "have",
        "a",
        "good",
        "friend",
        "few",
        "close",
        "friends",
        "my",
        "best",
        "is"
      ],
      "tip": "",
      "id": "A1-C14-T01",
      "targetWords": 6,
      "everyday": "Yeah, a really good one.",
      "reactive": false,
      "openAnswer": true
    },
    {
      "prompt": "What is your friend like?",
      "options": [
        "My friend is very kind.",
        "My friend is funny and friendly.",
        "My friend is quiet, but very kind."
      ],
      "keywords": [
        "my",
        "friend",
        "is",
        "very",
        "kind",
        "funny",
        "and",
        "friendly",
        "quiet",
        "but"
      ],
      "tip": "",
      "id": "A1-C14-T02",
      "targetWords": 6,
      "everyday": "Really kind, honestly.",
      "reactive": true,
      "openAnswer": true
    },
    {
      "prompt": "How often do you see your friend?",
      "options": [
        "I see my friend every week.",
        "I see my friend sometimes.",
        "We usually talk online."
      ],
      "keywords": [
        "i",
        "see",
        "my",
        "friend",
        "every",
        "week",
        "sometimes",
        "we",
        "usually",
        "talk",
        "online"
      ],
      "tip": "",
      "id": "A1-C14-T03",
      "targetWords": 6,
      "everyday": "Pretty much every week.",
      "reactive": false,
      "openAnswer": true
    },
    {
      "prompt": "What do you like doing together?",
      "options": [
        "We like talking and having coffee.",
        "We like walking in the park.",
        "We like watching films together."
      ],
      "keywords": [
        "we",
        "like",
        "talking",
        "and",
        "having",
        "coffee",
        "walking",
        "in",
        "the",
        "park",
        "watching",
        "films"
      ],
      "tip": "",
      "id": "A1-C14-T04",
      "targetWords": 6,
      "everyday": "Mostly just grab a coffee, really.",
      "reactive": true,
      "openAnswer": true
    },
    {
      "prompt": "Why is this friendship important to you?",
      "options": [
        "My friend always listens to me.",
        "My friend makes me feel happy.",
        "My friend helps me when I need it."
      ],
      "keywords": [
        "my",
        "friend",
        "always",
        "listens",
        "to",
        "me",
        "makes",
        "feel",
        "happy",
        "helps",
        "when",
        "i"
      ],
      "tip": "",
      "id": "A1-C14-T05",
      "targetWords": 6,
      "everyday": "Always there when I need to talk.",
      "reactive": false,
      "openAnswer": true
    }
  ]
}
];
