window.EASY_SPEAK_DATA = window.EASY_SPEAK_DATA || {};
window.EASY_SPEAK_DATA.A2 = [
  {
    "id": "A2-C01",
    "level": "A2",
    "emoji": "🍽️",
    "title": "At a restaurant",
    "topic": "Eating out",
    "estimatedMinutes": 4,
    "turns": [
      {
        "prompt": "You have just arrived at a restaurant. What would you like to order?",
        "options": [
          "I'd like grilled chicken with vegetables.",
          "Could I have the fish with salad, please?",
          "I'd like something light, perhaps fish and vegetables."
        ],
        "keywords": [
          "i'd",
          "like",
          "grilled",
          "chicken",
          "vegetables",
          "fish",
          "salad",
          "please",
          "something",
          "light"
        ],
        "tip": "",
        "id": "A2-C01-T01",
        "targetWords": 7,
        "everyday": "Could I’ve the fish with salad, please?",
        "reactive": false
      },
      {
        "prompt": "Before the waiter leaves, what else would you like to ask about your meal?",
        "options": [
          "Could you tell me if the dish is spicy?",
          "I would also like to know what comes with the meal.",
          "Could I ask whether the sauce is served separately?"
        ],
        "keywords": [
          "could",
          "tell",
          "dish",
          "spicy",
          "would",
          "also",
          "like",
          "know",
          "what",
          "comes",
          "with",
          "meal"
        ],
        "tip": "",
        "id": "A2-C01-T02",
        "targetWords": 10,
        "everyday": "I’d also like to know what comes with the meal.",
        "reactive": true
      },
      {
        "prompt": "How often do you eat out at a restaurant or café?",
        "options": [
          "I eat out about once a week.",
          "I sometimes go to a café at the weekend.",
          "I do not eat out very often, but I enjoy it when I do."
        ],
        "keywords": [
          "about",
          "once",
          "week",
          "sometimes",
          "weekend",
          "very",
          "often",
          "enjoy",
          "when"
        ],
        "tip": "",
        "id": "A2-C01-T03",
        "targetWords": 10,
        "everyday": "I don’t eat out very often, but I enjoy it when I do.",
        "reactive": false,
        "branches": [
          {
            "any": [
              "often",
              "usually",
              "week",
              "daily",
              "regularly"
            ],
            "prompt": "Since this sounds fairly familiar to you, would you choose a familiar dish or try something new today?"
          },
          {
            "any": [
              "not",
              "rarely",
              "never",
              "sometimes"
            ],
            "prompt": "If this is not something you do very often, would you choose a familiar dish or try something new today?"
          }
        ]
      },
      {
        "prompt": "Would you choose a familiar dish or try something new today?",
        "options": [
          "I would probably choose a familiar dish.",
          "I would like to try something new today.",
          "I usually choose something I know unless the special sounds good."
        ],
        "keywords": [
          "would",
          "probably",
          "choose",
          "familiar",
          "dish",
          "like",
          "something",
          "today",
          "usually",
          "know",
          "unless",
          "special"
        ],
        "tip": "",
        "id": "A2-C01-T04",
        "targetWords": 9,
        "everyday": "I’d probably choose a familiar dish.",
        "reactive": false
      },
      {
        "prompt": "Think about the last time you ate out. How did the meal go?",
        "options": [
          "The last meal went well and the service was friendly.",
          "Last time I ate out, I tried a new dish and liked it.",
          "It was fine, although we had to wait a little for the food."
        ],
        "keywords": [
          "last",
          "meal",
          "went",
          "well",
          "service",
          "friendly",
          "time",
          "tried",
          "dish",
          "liked",
          "fine",
          "although"
        ],
        "tip": "",
        "id": "A2-C01-T05",
        "targetWords": 12,
        "everyday": "Personally, the last meal went well and the service was friendly.",
        "reactive": true
      },
      {
        "prompt": "What can make ordering food difficult for you?",
        "options": [
          "It can be difficult when I do not understand the menu.",
          "Too many choices can make ordering a little confusing.",
          "It is harder when I need to ask about ingredients."
        ],
        "keywords": [
          "difficult",
          "when",
          "understand",
          "menu",
          "many",
          "choices",
          "make",
          "ordering",
          "little",
          "confusing",
          "harder",
          "need"
        ],
        "tip": "",
        "id": "A2-C01-T06",
        "targetWords": 10,
        "everyday": "It’s harder when I need to ask about ingredients.",
        "reactive": false
      },
      {
        "prompt": "Imagine the waiter brings the wrong dish. What would you say?",
        "options": [
          "Excuse me, I think this is not what I ordered.",
          "Sorry, I ordered the fish, not the chicken.",
          "Could you check my order, please? I think there has been a mistake."
        ],
        "keywords": [
          "excuse",
          "think",
          "this",
          "what",
          "ordered",
          "sorry",
          "fish",
          "chicken",
          "could",
          "check",
          "order",
          "please"
        ],
        "tip": "",
        "id": "A2-C01-T07",
        "targetWords": 10,
        "everyday": "Can you check my order, please? I think there has been a mistake.",
        "reactive": false,
        "branches": [
          {
            "any": [
              "ask",
              "help",
              "check",
              "explain",
              "repeat"
            ],
            "prompt": "That sounds like a practical response. Do you prefer eating out alone or with other people?"
          }
        ]
      },
      {
        "prompt": "Do you prefer eating out alone or with other people?",
        "options": [
          "I prefer eating with other people because we can talk.",
          "I do not mind eating alone if I am in a hurry.",
          "Usually I prefer company, but eating alone can be relaxing too."
        ],
        "keywords": [
          "prefer",
          "eating",
          "with",
          "other",
          "people",
          "because",
          "talk",
          "mind",
          "alone",
          "hurry",
          "usually",
          "company"
        ],
        "tip": "",
        "id": "A2-C01-T08",
        "targetWords": 11,
        "everyday": "I don’t mind eating alone if I’m in a hurry.",
        "reactive": true
      },
      {
        "prompt": "What would you do differently the next time you eat at a restaurant?",
        "options": [
          "Next time I will look at the menu before I arrive.",
          "I will ask about ingredients before I order.",
          "I would probably book a table earlier if the restaurant is busy."
        ],
        "keywords": [
          "next",
          "time",
          "will",
          "look",
          "menu",
          "before",
          "arrive",
          "about",
          "ingredients",
          "order",
          "would",
          "probably"
        ],
        "tip": "",
        "id": "A2-C01-T09",
        "targetWords": 10,
        "everyday": "I’d probably book a table earlier if the restaurant is busy.",
        "reactive": false
      },
      {
        "prompt": "The waiter asks if everything is okay. What useful sentence could you use?",
        "options": [
          "Everything is great, thank you.",
          "Yes, thank you. The food is very good.",
          "It is good, thanks. Could I have some water, please?"
        ],
        "keywords": [
          "everything",
          "great",
          "thank",
          "food",
          "very",
          "good",
          "thanks",
          "could",
          "have",
          "some",
          "water",
          "please"
        ],
        "tip": "",
        "id": "A2-C01-T10",
        "targetWords": 8,
        "everyday": "Thanks. The food is very good.",
        "reactive": false
      }
    ],
    "canDo": "Handle a simple restaurant exchange and solve a small ordering problem",
    "functions": [
      "transaction",
      "food",
      "repair"
    ],
    "cefrFocus": "Routine spoken interaction"
  },
  {
    "id": "A2-C02",
    "level": "A2",
    "emoji": "🗺️",
    "title": "Asking for directions",
    "topic": "Getting around",
    "estimatedMinutes": 4,
    "turns": [
      {
        "prompt": "You're looking for the train station. What do you ask?",
        "options": [
          "Excuse me, how can I get to the train station?",
          "Could you tell me the way to the train station?",
          "Hi, I'm looking for the train station. Is it far from here?"
        ],
        "keywords": [
          "excuse",
          "how",
          "get",
          "train",
          "station",
          "tell",
          "way",
          "i'm",
          "looking",
          "far"
        ],
        "tip": "",
        "id": "A2-C02-T01",
        "targetWords": 11,
        "everyday": "Can you tell me the way to the train station?",
        "reactive": false
      },
      {
        "prompt": "You are not sure you heard the street name. How would you check it?",
        "options": [
          "Sorry, did you say King Street?",
          "Could you repeat the street name, please?",
          "Just to check, is it the second street on the left?"
        ],
        "keywords": [
          "sorry",
          "king",
          "street",
          "could",
          "repeat",
          "name",
          "please",
          "just",
          "check",
          "second",
          "left"
        ],
        "tip": "",
        "id": "A2-C02-T02",
        "targetWords": 8,
        "everyday": "Can you repeat the street name, please?",
        "reactive": true
      },
      {
        "prompt": "How often do you need to ask for directions in a new place?",
        "options": [
          "I ask for directions mostly when I travel.",
          "Not very often because I usually use a map.",
          "I sometimes ask when the map is not clear."
        ],
        "keywords": [
          "directions",
          "mostly",
          "when",
          "travel",
          "very",
          "often",
          "because",
          "usually",
          "sometimes",
          "clear"
        ],
        "tip": "",
        "id": "A2-C02-T03",
        "targetWords": 9,
        "everyday": "Personally, i ask for directions mostly when I travel.",
        "reactive": false,
        "branches": [
          {
            "any": [
              "often",
              "usually",
              "week",
              "daily",
              "regularly"
            ],
            "prompt": "Since this sounds fairly familiar to you, would you rather use a map on your phone or ask a person nearby?"
          },
          {
            "any": [
              "not",
              "rarely",
              "never",
              "sometimes"
            ],
            "prompt": "If this is not something you do very often, would you rather use a map on your phone or ask a person nearby?"
          }
        ]
      },
      {
        "prompt": "Would you rather use a map on your phone or ask a person nearby?",
        "options": [
          "I usually prefer a map on my phone.",
          "I would rather ask someone if I am really lost.",
          "I use my phone first, but I ask a person when I need a quick answer."
        ],
        "keywords": [
          "usually",
          "prefer",
          "phone",
          "would",
          "rather",
          "someone",
          "really",
          "lost",
          "first",
          "person",
          "when",
          "need"
        ],
        "tip": "",
        "id": "A2-C02-T04",
        "targetWords": 11,
        "everyday": "I’d rather ask someone if I’m really lost.",
        "reactive": false
      },
      {
        "prompt": "Tell me about a time when finding a place took longer than expected.",
        "options": [
          "Once I missed a turn and walked several extra blocks.",
          "I remember looking for a museum and going past it twice.",
          "On one trip, the street names were confusing, so it took longer than planned."
        ],
        "keywords": [
          "once",
          "missed",
          "turn",
          "walked",
          "several",
          "extra",
          "blocks",
          "remember",
          "looking",
          "museum",
          "going",
          "past"
        ],
        "tip": "",
        "id": "A2-C02-T05",
        "targetWords": 12,
        "everyday": "Personally, once I missed a turn and walked several extra blocks.",
        "reactive": true
      },
      {
        "prompt": "What can make spoken directions difficult to follow?",
        "options": [
          "Long instructions are hard to remember.",
          "It is difficult when people speak very quickly.",
          "Similar street names can make directions confusing."
        ],
        "keywords": [
          "long",
          "instructions",
          "hard",
          "remember",
          "difficult",
          "when",
          "people",
          "speak",
          "very",
          "quickly",
          "similar",
          "street"
        ],
        "tip": "",
        "id": "A2-C02-T06",
        "targetWords": 7,
        "everyday": "It’s difficult when people speak very quickly.",
        "reactive": false
      },
      {
        "prompt": "If you realise you walked the wrong way, what would you do?",
        "options": [
          "I would stop, check the map and return to the last place I recognised.",
          "I would ask someone nearby instead of continuing in the wrong direction.",
          "I would go back one block and check the route again."
        ],
        "keywords": [
          "would",
          "stop",
          "check",
          "return",
          "last",
          "place",
          "recognised",
          "someone",
          "nearby",
          "instead",
          "continuing",
          "wrong"
        ],
        "tip": "",
        "id": "A2-C02-T07",
        "targetWords": 12,
        "everyday": "I’d ask someone nearby instead of continuing in the wrong direction.",
        "reactive": false,
        "branches": [
          {
            "any": [
              "ask",
              "help",
              "check",
              "explain",
              "repeat"
            ],
            "prompt": "That sounds like a practical response. Would you prefer someone to show you on a map or explain the route aloud?"
          }
        ]
      },
      {
        "prompt": "Would you prefer someone to show you on a map or explain the route aloud?",
        "options": [
          "I prefer seeing the route on a map.",
          "A short spoken explanation is usually enough for me.",
          "I like both: a quick explanation and a point on the map."
        ],
        "keywords": [
          "prefer",
          "seeing",
          "route",
          "short",
          "spoken",
          "explanation",
          "usually",
          "enough",
          "like",
          "both",
          "quick",
          "point"
        ],
        "tip": "",
        "id": "A2-C02-T08",
        "targetWords": 10,
        "everyday": "I’d rather seeing the route on a map.",
        "reactive": true
      },
      {
        "prompt": "What could you prepare before visiting an unfamiliar neighbourhood?",
        "options": [
          "I could save the address and check the nearest station first.",
          "I would download the map before leaving.",
          "I could look at the main landmarks near the destination."
        ],
        "keywords": [
          "could",
          "save",
          "address",
          "check",
          "nearest",
          "station",
          "first",
          "would",
          "download",
          "before",
          "leaving",
          "look"
        ],
        "tip": "",
        "id": "A2-C02-T09",
        "targetWords": 9,
        "everyday": "I’d download the map before leaving.",
        "reactive": false
      },
      {
        "prompt": "You are still unsure of the route. What simple sentence could you say?",
        "options": [
          "Could you show me on the map, please?",
          "Sorry, could you explain that last part again?",
          "Am I going in the right direction for the station?"
        ],
        "keywords": [
          "could",
          "show",
          "please",
          "sorry",
          "explain",
          "that",
          "last",
          "part",
          "again",
          "going",
          "right",
          "direction"
        ],
        "tip": "",
        "id": "A2-C02-T10",
        "targetWords": 9,
        "everyday": "Can you show me on the map, please?",
        "reactive": false
      }
    ],
    "canDo": "Ask for, understand and confirm simple directions",
    "functions": [
      "directions",
      "clarify",
      "places"
    ],
    "cefrFocus": "Routine spoken interaction"
  },
  {
    "id": "A2-C03",
    "level": "A2",
    "emoji": "🏨",
    "title": "Checking into a hotel",
    "topic": "Travel",
    "estimatedMinutes": 4,
    "turns": [
      {
        "prompt": "You've arrived at your hotel. What do you say at reception?",
        "options": [
          "Hello, I have a reservation under Andrade.",
          "Hi, I'd like to check in, please.",
          "Good evening. I have a booking for tonight."
        ],
        "keywords": [
          "hello",
          "reservation",
          "under",
          "andrade",
          "i'd",
          "like",
          "check",
          "please",
          "good",
          "evening"
        ],
        "tip": "",
        "id": "A2-C03-T01",
        "targetWords": 7,
        "everyday": "Good evening. I’ve a booking for tonight.",
        "reactive": false
      },
      {
        "prompt": "At reception, what extra information would you like to ask about your room?",
        "options": [
          "Could you tell me what time breakfast starts?",
          "I would like to know whether Wi-Fi is included.",
          "Could I ask if the room is on a quiet floor?"
        ],
        "keywords": [
          "could",
          "tell",
          "what",
          "time",
          "breakfast",
          "starts",
          "would",
          "like",
          "know",
          "whether",
          "included",
          "room"
        ],
        "tip": "",
        "id": "A2-C03-T02",
        "targetWords": 9,
        "everyday": "Can you tell me what time breakfast starts?",
        "reactive": true
      },
      {
        "prompt": "How often do you stay in hotels or similar accommodation?",
        "options": [
          "I stay in hotels a few times a year.",
          "Mostly when I travel for work or holidays.",
          "Not very often, but I have stayed in several hotels."
        ],
        "keywords": [
          "stay",
          "hotels",
          "times",
          "year",
          "mostly",
          "when",
          "travel",
          "work",
          "holidays",
          "very",
          "often",
          "have"
        ],
        "tip": "",
        "id": "A2-C03-T03",
        "targetWords": 9,
        "everyday": "Not very often, but I’ve stayed in several hotels.",
        "reactive": false,
        "branches": [
          {
            "any": [
              "often",
              "usually",
              "week",
              "daily",
              "regularly"
            ],
            "prompt": "Since this sounds fairly familiar to you, would you prefer a quiet room or one with a better view?"
          },
          {
            "any": [
              "not",
              "rarely",
              "never",
              "sometimes"
            ],
            "prompt": "If this is not something you do very often, would you prefer a quiet room or one with a better view?"
          }
        ]
      },
      {
        "prompt": "Would you prefer a quiet room or one with a better view?",
        "options": [
          "I would prefer a quiet room so I can sleep well.",
          "I would choose the better view if the hotel is not noisy.",
          "A quiet room matters more to me than the view."
        ],
        "keywords": [
          "would",
          "prefer",
          "quiet",
          "room",
          "sleep",
          "well",
          "choose",
          "better",
          "view",
          "hotel",
          "noisy",
          "matters"
        ],
        "tip": "",
        "id": "A2-C03-T04",
        "targetWords": 11,
        "everyday": "I’d prefer a quiet room so I can sleep well.",
        "reactive": false
      },
      {
        "prompt": "Think of a previous hotel stay. What was one thing you liked or disliked?",
        "options": [
          "My last hotel was comfortable and very clean.",
          "I once stayed in a hotel where the room was smaller than expected.",
          "The staff were friendly, but breakfast was quite crowded."
        ],
        "keywords": [
          "last",
          "hotel",
          "comfortable",
          "very",
          "clean",
          "once",
          "stayed",
          "where",
          "room",
          "smaller",
          "than",
          "expected"
        ],
        "tip": "",
        "id": "A2-C03-T05",
        "targetWords": 10,
        "everyday": "Personally, my last hotel was comfortable and very clean.",
        "reactive": true
      },
      {
        "prompt": "What small problem can happen when checking into a hotel?",
        "options": [
          "The booking may not appear immediately in the system.",
          "Sometimes the room is not ready at the expected time.",
          "A guest may need to confirm a detail such as breakfast or Wi-Fi."
        ],
        "keywords": [
          "booking",
          "appear",
          "immediately",
          "system",
          "sometimes",
          "room",
          "ready",
          "expected",
          "time",
          "guest",
          "need",
          "confirm"
        ],
        "tip": "",
        "id": "A2-C03-T06",
        "targetWords": 11,
        "everyday": "Personally, the booking may not appear immediately in the system.",
        "reactive": false
      },
      {
        "prompt": "If the room is not ready, what could you ask the receptionist?",
        "options": [
          "Could I leave my luggage here until the room is ready?",
          "Do you know approximately when I can check in?",
          "Could you call me when the room becomes available?"
        ],
        "keywords": [
          "could",
          "leave",
          "luggage",
          "here",
          "until",
          "room",
          "ready",
          "know",
          "approximately",
          "when",
          "check",
          "call"
        ],
        "tip": "",
        "id": "A2-C03-T07",
        "targetWords": 10,
        "everyday": "Can you call me when the room becomes available?",
        "reactive": false,
        "branches": [
          {
            "any": [
              "ask",
              "help",
              "check",
              "explain",
              "repeat"
            ],
            "prompt": "That sounds like a practical response. When you travel, do you prefer staying alone or sharing accommodation?"
          }
        ]
      },
      {
        "prompt": "When you travel, do you prefer staying alone or sharing accommodation?",
        "options": [
          "I usually prefer my own room.",
          "I am happy to share accommodation with family or close friends.",
          "It depends on the trip, but I normally like having some privacy."
        ],
        "keywords": [
          "usually",
          "prefer",
          "room",
          "happy",
          "share",
          "accommodation",
          "with",
          "family",
          "close",
          "friends",
          "depends",
          "trip"
        ],
        "tip": "",
        "id": "A2-C03-T08",
        "targetWords": 10,
        "everyday": "I’d usually go with my own room.",
        "reactive": true
      },
      {
        "prompt": "What would you check before booking your next hotel?",
        "options": [
          "I would check the location and recent reviews.",
          "I would confirm the check-in time and what is included.",
          "Next time I will compare the room type and cancellation policy carefully."
        ],
        "keywords": [
          "would",
          "check",
          "location",
          "recent",
          "reviews",
          "confirm",
          "time",
          "what",
          "included",
          "next",
          "will",
          "compare"
        ],
        "tip": "",
        "id": "A2-C03-T09",
        "targetWords": 10,
        "everyday": "I’d confirm the check-in time and what is included.",
        "reactive": false
      },
      {
        "prompt": "You need help from reception. What useful sentence could you use?",
        "options": [
          "Could you help me with my room, please?",
          "Could I have another towel, please?",
          "Excuse me, could you tell me how to get to reception from here?"
        ],
        "keywords": [
          "could",
          "help",
          "with",
          "room",
          "please",
          "have",
          "another",
          "towel",
          "excuse",
          "tell",
          "reception",
          "from"
        ],
        "tip": "",
        "id": "A2-C03-T10",
        "targetWords": 9,
        "everyday": "Can you help me with my room, please?",
        "reactive": false
      }
    ],
    "canDo": "Check into accommodation and ask about basic services",
    "functions": [
      "travel",
      "transaction",
      "requests"
    ],
    "cefrFocus": "Routine spoken interaction"
  },
  {
    "id": "A2-C04",
    "level": "A2",
    "emoji": "🚌",
    "title": "Using public transport",
    "topic": "Transport",
    "estimatedMinutes": 4,
    "turns": [
      {
        "prompt": "You need to get across the city. What do you ask?",
        "options": [
          "Which bus goes to the city centre?",
          "Could you tell me which bus I should take?",
          "What's the best way to get to the city centre by public transport?"
        ],
        "keywords": [
          "which",
          "bus",
          "goes",
          "city",
          "centre",
          "tell",
          "take",
          "what's",
          "best",
          "way"
        ],
        "tip": "",
        "id": "A2-C04-T01",
        "targetWords": 10,
        "everyday": "Can you tell me which bus I should take?",
        "reactive": false
      },
      {
        "prompt": "Before you get on, what detail about the journey would you like to confirm?",
        "options": [
          "Does this bus stop near the city centre?",
          "Could you tell me how many stops it is from here?",
          "I would like to confirm whether I need to change buses."
        ],
        "keywords": [
          "does",
          "this",
          "stop",
          "near",
          "city",
          "centre",
          "could",
          "tell",
          "many",
          "stops",
          "from",
          "here"
        ],
        "tip": "",
        "id": "A2-C04-T02",
        "targetWords": 10,
        "everyday": "Can you tell me how many stops it is from here?",
        "reactive": true
      },
      {
        "prompt": "How often do you use buses, trains or metro services?",
        "options": [
          "I use public transport several times a week.",
          "I take a bus when I need to go across the city.",
          "I do not use it every day, but I use it fairly often."
        ],
        "keywords": [
          "public",
          "transport",
          "several",
          "times",
          "week",
          "take",
          "when",
          "need",
          "across",
          "city",
          "every",
          "fairly"
        ],
        "tip": "",
        "id": "A2-C04-T03",
        "targetWords": 11,
        "everyday": "I don’t use it every day, but I use it fairly often.",
        "reactive": false,
        "branches": [
          {
            "any": [
              "often",
              "usually",
              "week",
              "daily",
              "regularly"
            ],
            "prompt": "Since this sounds fairly familiar to you, for a short journey, would you prefer public transport or walking?"
          },
          {
            "any": [
              "not",
              "rarely",
              "never",
              "sometimes"
            ],
            "prompt": "If this is not something you do very often, for a short journey, would you prefer public transport or walking?"
          }
        ]
      },
      {
        "prompt": "For a short journey, would you prefer public transport or walking?",
        "options": [
          "I would walk if the place is close.",
          "I would take public transport if I am carrying something heavy.",
          "For a short trip I usually walk, unless the weather is bad."
        ],
        "keywords": [
          "would",
          "walk",
          "place",
          "close",
          "take",
          "public",
          "transport",
          "carrying",
          "something",
          "heavy",
          "short",
          "trip"
        ],
        "tip": "",
        "id": "A2-C04-T04",
        "targetWords": 10,
        "everyday": "I’d walk if the place is close.",
        "reactive": false
      },
      {
        "prompt": "Tell me about a public-transport journey that did not go exactly as planned.",
        "options": [
          "Once a train was delayed and I arrived later than expected.",
          "I missed my stop once because I was not paying attention.",
          "A bus changed its route, so I had to ask where to get off."
        ],
        "keywords": [
          "once",
          "train",
          "delayed",
          "arrived",
          "later",
          "than",
          "expected",
          "missed",
          "stop",
          "because",
          "paying",
          "attention"
        ],
        "tip": "",
        "id": "A2-C04-T05",
        "targetWords": 12,
        "everyday": "Personally, once a train was delayed and I arrived later than expected.",
        "reactive": true
      },
      {
        "prompt": "What can make a bus or train journey confusing?",
        "options": [
          "Changes and platform numbers can be confusing.",
          "It is hard when the information is only announced very quickly.",
          "A route is difficult when I do not know where to change."
        ],
        "keywords": [
          "changes",
          "platform",
          "numbers",
          "confusing",
          "hard",
          "when",
          "information",
          "only",
          "announced",
          "very",
          "quickly",
          "route"
        ],
        "tip": "",
        "id": "A2-C04-T06",
        "targetWords": 10,
        "everyday": "A route is difficult when I don’t know where to change.",
        "reactive": false
      },
      {
        "prompt": "If your bus is delayed and you have an appointment, what would you do?",
        "options": [
          "I would send a message to say I might be late.",
          "I would check whether another route is faster.",
          "I would get off and look for another transport option if the delay was long."
        ],
        "keywords": [
          "would",
          "send",
          "message",
          "might",
          "late",
          "check",
          "whether",
          "another",
          "route",
          "faster",
          "look",
          "transport"
        ],
        "tip": "",
        "id": "A2-C04-T07",
        "targetWords": 11,
        "everyday": "I’d send a message to say I might be late.",
        "reactive": false,
        "branches": [
          {
            "any": [
              "ask",
              "help",
              "check",
              "explain",
              "repeat"
            ],
            "prompt": "That sounds like a practical response. Do you prefer travelling on public transport alone or with someone?"
          }
        ]
      },
      {
        "prompt": "Do you prefer travelling on public transport alone or with someone?",
        "options": [
          "I am comfortable travelling alone.",
          "I prefer going with someone when I do not know the route.",
          "For familiar journeys I go alone, but company is useful in a new city."
        ],
        "keywords": [
          "comfortable",
          "travelling",
          "alone",
          "prefer",
          "going",
          "with",
          "someone",
          "when",
          "know",
          "route",
          "familiar",
          "journeys"
        ],
        "tip": "",
        "id": "A2-C04-T08",
        "targetWords": 10,
        "everyday": "I’d rather going with someone when I don’t know the route.",
        "reactive": true
      },
      {
        "prompt": "What could make your next public-transport journey easier?",
        "options": [
          "I could check the route and timetable before leaving.",
          "I would keep the ticket or transport app ready.",
          "Next time I will leave a little earlier in case there is a delay."
        ],
        "keywords": [
          "could",
          "check",
          "route",
          "timetable",
          "before",
          "leaving",
          "would",
          "keep",
          "ticket",
          "transport",
          "ready",
          "next"
        ],
        "tip": "",
        "id": "A2-C04-T09",
        "targetWords": 11,
        "everyday": "I’d keep the ticket or transport app ready.",
        "reactive": false
      },
      {
        "prompt": "You need information from a driver or station worker. What could you say?",
        "options": [
          "Excuse me, is this the right bus for the centre?",
          "Could you tell me where I should get off?",
          "Is there another train to the airport soon?"
        ],
        "keywords": [
          "excuse",
          "this",
          "right",
          "centre",
          "could",
          "tell",
          "where",
          "should",
          "there",
          "another",
          "train",
          "airport"
        ],
        "tip": "",
        "id": "A2-C04-T10",
        "targetWords": 9,
        "everyday": "Can you tell me where I should get off?",
        "reactive": false
      }
    ],
    "canDo": "Manage a routine public-transport journey",
    "functions": [
      "transport",
      "information",
      "problem solving"
    ],
    "cefrFocus": "Routine spoken interaction"
  },
  {
    "id": "A2-C05",
    "level": "A2",
    "emoji": "💊",
    "title": "At the pharmacy",
    "topic": "Health situations",
    "estimatedMinutes": 4,
    "turns": [
      {
        "prompt": "You need something for a mild headache. What do you say?",
        "options": [
          "I have a mild headache. Do you have something that might help?",
          "Could you recommend something for a headache?",
          "I've had a headache today. What can I take for it?"
        ],
        "keywords": [
          "mild",
          "headache",
          "something",
          "might",
          "help",
          "recommend",
          "i've",
          "today",
          "what",
          "take"
        ],
        "tip": "",
        "id": "A2-C05-T01",
        "targetWords": 10,
        "everyday": "Can you recommend something for a headache?",
        "reactive": false
      },
      {
        "prompt": "What extra information about your symptoms would you tell the pharmacist?",
        "options": [
          "I would say when the problem started and how I feel now.",
          "I would explain whether I have a fever or any other symptoms.",
          "I would mention how long I have had the problem and whether it is getting worse."
        ],
        "keywords": [
          "would",
          "when",
          "problem",
          "started",
          "feel",
          "explain",
          "whether",
          "have",
          "fever",
          "other",
          "symptoms",
          "mention"
        ],
        "tip": "",
        "id": "A2-C05-T02",
        "targetWords": 13,
        "everyday": "I’d mention how long I’ve had the problem and whether it is getting worse.",
        "reactive": true
      },
      {
        "prompt": "Is going to a pharmacy something you need to do often?",
        "options": [
          "No, only when I have a minor health problem.",
          "I go occasionally for simple medicines or advice.",
          "Not very often, but I know where my nearest pharmacy is."
        ],
        "keywords": [
          "only",
          "when",
          "have",
          "minor",
          "health",
          "problem",
          "occasionally",
          "simple",
          "medicines",
          "advice",
          "very",
          "often"
        ],
        "tip": "",
        "id": "A2-C05-T03",
        "targetWords": 9,
        "everyday": "No, only when I’ve a minor health problem.",
        "reactive": false,
        "branches": [
          {
            "any": [
              "often",
              "usually",
              "week",
              "daily",
              "regularly"
            ],
            "prompt": "Since this sounds fairly familiar to you, would you prefer tablets, a cream or another simple option if several are suitable?"
          },
          {
            "any": [
              "not",
              "rarely",
              "never",
              "sometimes"
            ],
            "prompt": "If this is not something you do very often, would you prefer tablets, a cream or another simple option if several are suitable?"
          }
        ]
      },
      {
        "prompt": "Would you prefer tablets, a cream or another simple option if several are suitable?",
        "options": [
          "I would choose the option that is easiest to use.",
          "If they work in the same way, I usually prefer tablets.",
          "I would ask the pharmacist which option is more suitable for my situation."
        ],
        "keywords": [
          "would",
          "choose",
          "option",
          "that",
          "easiest",
          "they",
          "work",
          "same",
          "usually",
          "prefer",
          "tablets",
          "pharmacist"
        ],
        "tip": "",
        "id": "A2-C05-T04",
        "targetWords": 11,
        "everyday": "I’d choose the option that is easiest to use.",
        "reactive": false
      },
      {
        "prompt": "Think about the last time you asked a pharmacist for help. What happened?",
        "options": [
          "The pharmacist asked a few questions and suggested an over-the-counter option.",
          "Last time I needed advice for a minor problem and the explanation was clear.",
          "I once had to ask the pharmacist to repeat the dosage instructions."
        ],
        "keywords": [
          "pharmacist",
          "asked",
          "questions",
          "suggested",
          "over",
          "counter",
          "option",
          "last",
          "time",
          "needed",
          "advice",
          "minor"
        ],
        "tip": "",
        "id": "A2-C05-T05",
        "targetWords": 12,
        "everyday": "Personally, the pharmacist asked a few questions and suggested an over-the-counter option.",
        "reactive": true
      },
      {
        "prompt": "What can make a pharmacy conversation difficult?",
        "options": [
          "Medicine names and dosage instructions can be difficult.",
          "It is hard if I cannot explain exactly how I feel.",
          "The conversation is more difficult when there are several similar products."
        ],
        "keywords": [
          "medicine",
          "names",
          "dosage",
          "instructions",
          "difficult",
          "hard",
          "cannot",
          "explain",
          "exactly",
          "feel",
          "conversation",
          "more"
        ],
        "tip": "",
        "id": "A2-C05-T06",
        "targetWords": 10,
        "everyday": "It’s hard if I can’t explain exactly how I feel.",
        "reactive": false
      },
      {
        "prompt": "If you do not understand the instructions, what should you ask?",
        "options": [
          "Could you explain how often I should use it?",
          "Sorry, could you repeat the instructions more slowly?",
          "Could you write down when I should take it, please?"
        ],
        "keywords": [
          "could",
          "explain",
          "often",
          "should",
          "sorry",
          "repeat",
          "instructions",
          "more",
          "slowly",
          "write",
          "down",
          "when"
        ],
        "tip": "",
        "id": "A2-C05-T07",
        "targetWords": 9,
        "everyday": "Can you explain how often I should use it?",
        "reactive": false,
        "branches": [
          {
            "any": [
              "ask",
              "help",
              "check",
              "explain",
              "repeat"
            ],
            "prompt": "That sounds like a practical response. Would you rather explain the problem yourself or have someone help you communicate?"
          }
        ]
      },
      {
        "prompt": "Would you rather explain the problem yourself or have someone help you communicate?",
        "options": [
          "I would normally explain it myself.",
          "If the situation were complicated, I would be happy to have help.",
          "I prefer speaking for myself, but support can help if I do not know the words."
        ],
        "keywords": [
          "would",
          "normally",
          "explain",
          "myself",
          "situation",
          "were",
          "complicated",
          "happy",
          "have",
          "help",
          "prefer",
          "speaking"
        ],
        "tip": "",
        "id": "A2-C05-T08",
        "targetWords": 11,
        "everyday": "I’d rather speaking for myself, but support can help if I don’t know the words.",
        "reactive": true
      },
      {
        "prompt": "What information would you prepare before asking about a medicine?",
        "options": [
          "I would know what symptoms I have and how long they have lasted.",
          "I would bring a list of any medicines I already use.",
          "I would be ready to mention allergies or other important information."
        ],
        "keywords": [
          "would",
          "know",
          "what",
          "symptoms",
          "have",
          "long",
          "they",
          "lasted",
          "bring",
          "list",
          "medicines",
          "already"
        ],
        "tip": "",
        "id": "A2-C05-T09",
        "targetWords": 12,
        "everyday": "I’d know what symptoms I’ve and how long they have lasted.",
        "reactive": false
      },
      {
        "prompt": "Before you leave, what useful question could you ask the pharmacist?",
        "options": [
          "How often should I take this?",
          "Are there any common side effects I should know about?",
          "When should I speak to a doctor if I do not feel better?"
        ],
        "keywords": [
          "often",
          "should",
          "take",
          "this",
          "there",
          "common",
          "side",
          "effects",
          "know",
          "about",
          "when",
          "speak"
        ],
        "tip": "",
        "id": "A2-C05-T10",
        "targetWords": 10,
        "everyday": "When should I speak to a doctor if I don’t feel better?",
        "reactive": false
      }
    ],
    "canDo": "Explain a simple health need at a pharmacy",
    "functions": [
      "health",
      "requests",
      "clarify"
    ],
    "cefrFocus": "Routine spoken interaction"
  },
  {
    "id": "A2-C06",
    "level": "A2",
    "emoji": "🎉",
    "title": "Making plans with a friend",
    "topic": "Social plans",
    "estimatedMinutes": 4,
    "turns": [
      {
        "prompt": "A friend asks what you'd like to do tomorrow. What do you suggest?",
        "options": [
          "Why don't we have lunch together?",
          "We could go for a walk and have coffee.",
          "I'd like to do something relaxed. How about lunch in town?"
        ],
        "keywords": [
          "why",
          "don't",
          "lunch",
          "together",
          "walk",
          "coffee",
          "i'd",
          "like",
          "something",
          "relaxed"
        ],
        "tip": "",
        "id": "A2-C06-T01",
        "targetWords": 9,
        "everyday": "Hey, why don't we have lunch together?",
        "reactive": false
      },
      {
        "prompt": "Your friend is interested. What extra detail about the plan would you give?",
        "options": [
          "We could meet around six and have something to eat.",
          "I was thinking about meeting near the park after work.",
          "We can keep it simple and decide the exact place later."
        ],
        "keywords": [
          "could",
          "meet",
          "around",
          "have",
          "something",
          "thinking",
          "about",
          "meeting",
          "near",
          "park",
          "after",
          "work"
        ],
        "tip": "",
        "id": "A2-C06-T02",
        "targetWords": 10,
        "everyday": "Personally, we could meet around six and have something to eat.",
        "reactive": true
      },
      {
        "prompt": "How often do you make plans with friends during the week?",
        "options": [
          "I make plans with friends once or twice a week.",
          "Mostly at weekends when everyone has more time.",
          "It depends on work, but I try to see friends regularly."
        ],
        "keywords": [
          "make",
          "plans",
          "with",
          "friends",
          "once",
          "twice",
          "week",
          "mostly",
          "weekends",
          "when",
          "everyone",
          "more"
        ],
        "tip": "",
        "id": "A2-C06-T03",
        "targetWords": 10,
        "everyday": "Personally, i make plans with friends once or twice a week.",
        "reactive": false,
        "branches": [
          {
            "any": [
              "often",
              "usually",
              "week",
              "daily",
              "regularly"
            ],
            "prompt": "Since this sounds fairly familiar to you, would you rather meet somewhere quiet or somewhere lively?"
          },
          {
            "any": [
              "not",
              "rarely",
              "never",
              "sometimes"
            ],
            "prompt": "If this is not something you do very often, would you rather meet somewhere quiet or somewhere lively?"
          }
        ]
      },
      {
        "prompt": "Would you rather meet somewhere quiet or somewhere lively?",
        "options": [
          "I would prefer somewhere quiet so we can talk.",
          "A lively place sounds good if we want music and food.",
          "It depends on the day, but I usually choose somewhere relaxed."
        ],
        "keywords": [
          "would",
          "prefer",
          "somewhere",
          "quiet",
          "talk",
          "lively",
          "place",
          "sounds",
          "good",
          "want",
          "music",
          "food"
        ],
        "tip": "",
        "id": "A2-C06-T04",
        "targetWords": 10,
        "everyday": "I’d prefer somewhere quiet so we can talk.",
        "reactive": false
      },
      {
        "prompt": "Tell me about a recent plan with friends that changed at the last minute.",
        "options": [
          "Recently a friend was late, so we changed the restaurant.",
          "One plan changed because the weather got bad.",
          "Last month we moved a meeting to another day because someone had to work."
        ],
        "keywords": [
          "recently",
          "friend",
          "late",
          "changed",
          "restaurant",
          "plan",
          "because",
          "weather",
          "last",
          "month",
          "moved",
          "meeting"
        ],
        "tip": "",
        "id": "A2-C06-T05",
        "targetWords": 11,
        "everyday": "Personally, recently a friend was late, so we changed the restaurant.",
        "reactive": true
      },
      {
        "prompt": "What can make organising a simple plan difficult?",
        "options": [
          "Different schedules can make it difficult.",
          "It is harder when nobody wants to choose the place.",
          "Transport and last-minute changes can complicate a simple plan."
        ],
        "keywords": [
          "different",
          "schedules",
          "make",
          "difficult",
          "harder",
          "when",
          "nobody",
          "wants",
          "choose",
          "place",
          "transport",
          "last"
        ],
        "tip": "",
        "id": "A2-C06-T06",
        "targetWords": 8,
        "everyday": "It’s harder when nobody wants to choose the place.",
        "reactive": false
      },
      {
        "prompt": "If your friend cannot come at the agreed time, what would you suggest?",
        "options": [
          "We could meet an hour later.",
          "I would suggest another day if the delay is too long.",
          "We can change the place or time, whatever is easier."
        ],
        "keywords": [
          "could",
          "meet",
          "hour",
          "later",
          "would",
          "suggest",
          "another",
          "delay",
          "long",
          "change",
          "place",
          "time"
        ],
        "tip": "",
        "id": "A2-C06-T07",
        "targetWords": 9,
        "everyday": "I’d suggest another day if the delay is too long.",
        "reactive": false,
        "branches": [
          {
            "any": [
              "ask",
              "help",
              "check",
              "explain",
              "repeat"
            ],
            "prompt": "That sounds like a practical response. Do you prefer planning with one friend or with a larger group?"
          }
        ]
      },
      {
        "prompt": "Do you prefer planning with one friend or with a larger group?",
        "options": [
          "I find it easier to plan with one or two friends.",
          "A larger group can be fun, but it takes more organisation.",
          "I enjoy both, although small plans are usually simpler."
        ],
        "keywords": [
          "find",
          "easier",
          "plan",
          "with",
          "friends",
          "larger",
          "group",
          "takes",
          "more",
          "organisation",
          "enjoy",
          "both"
        ],
        "tip": "",
        "id": "A2-C06-T08",
        "targetWords": 10,
        "everyday": "Personally, i find it easier to plan with one or two friends.",
        "reactive": true
      },
      {
        "prompt": "What could you do to make the next plan easier to organise?",
        "options": [
          "I could confirm the time earlier in the day.",
          "Next time I will suggest two clear options instead of many.",
          "I would choose a place that is easy for everyone to reach."
        ],
        "keywords": [
          "could",
          "confirm",
          "time",
          "earlier",
          "next",
          "will",
          "suggest",
          "clear",
          "options",
          "instead",
          "many",
          "would"
        ],
        "tip": "",
        "id": "A2-C06-T09",
        "targetWords": 11,
        "everyday": "I’d choose a place that is easy for everyone to reach.",
        "reactive": false
      },
      {
        "prompt": "You want to confirm the plan. What message or sentence could you use?",
        "options": [
          "Are we still meeting at six?",
          "Just checking: does the café at six still work for you?",
          "Let me know if anything changes. See you later!"
        ],
        "keywords": [
          "still",
          "meeting",
          "just",
          "checking",
          "does",
          "work",
          "know",
          "anything",
          "changes",
          "later"
        ],
        "tip": "",
        "id": "A2-C06-T10",
        "targetWords": 9,
        "everyday": "Hey, are we still meeting at six?",
        "reactive": false
      }
    ],
    "canDo": "Make, change and confirm social plans",
    "functions": [
      "plans",
      "social",
      "negotiation"
    ],
    "cefrFocus": "Routine spoken interaction"
  },
  {
    "id": "A2-C07",
    "level": "A2",
    "emoji": "👕",
    "title": "Shopping for clothes",
    "topic": "Shopping",
    "estimatedMinutes": 4,
    "turns": [
      {
        "prompt": "You need a jacket but you can't find your size. What do you ask?",
        "options": [
          "Do you have this jacket in a medium?",
          "Could I try this in a different size?",
          "I like this jacket. Do you have a medium one?"
        ],
        "keywords": [
          "jacket",
          "medium",
          "try",
          "different",
          "size",
          "like",
          "one"
        ],
        "tip": "",
        "id": "A2-C07-T01",
        "targetWords": 9,
        "everyday": "Hey, do you have this jacket in a medium?",
        "reactive": false
      },
      {
        "prompt": "What else would you like to know about the item before trying it on?",
        "options": [
          "Do you have this in another colour?",
          "Could you tell me if this material is easy to wash?",
          "I would like to know whether there is a smaller size."
        ],
        "keywords": [
          "have",
          "this",
          "another",
          "colour",
          "could",
          "tell",
          "material",
          "easy",
          "wash",
          "would",
          "like",
          "know"
        ],
        "tip": "",
        "id": "A2-C07-T02",
        "targetWords": 10,
        "everyday": "Can you tell me if this material is easy to wash?",
        "reactive": true
      },
      {
        "prompt": "How often do you buy clothes in a shop rather than online?",
        "options": [
          "I buy clothes in shops a few times a year.",
          "I often look online first and then go to a shop.",
          "Not very often, because I only buy clothes when I need something."
        ],
        "keywords": [
          "clothes",
          "shops",
          "times",
          "year",
          "often",
          "look",
          "online",
          "first",
          "then",
          "shop",
          "very",
          "because"
        ],
        "tip": "",
        "id": "A2-C07-T03",
        "targetWords": 11,
        "everyday": "Personally, i buy clothes in shops a few times a year.",
        "reactive": false,
        "branches": [
          {
            "any": [
              "often",
              "usually",
              "week",
              "daily",
              "regularly"
            ],
            "prompt": "Since this sounds fairly familiar to you, would you choose comfort, style or price first for this purchase?"
          },
          {
            "any": [
              "not",
              "rarely",
              "never",
              "sometimes"
            ],
            "prompt": "If this is not something you do very often, would you choose comfort, style or price first for this purchase?"
          }
        ]
      },
      {
        "prompt": "Would you choose comfort, style or price first for this purchase?",
        "options": [
          "Comfort is usually the most important thing for me.",
          "I would look at the price first if I have a budget.",
          "I want it to look good, but it also needs to feel comfortable."
        ],
        "keywords": [
          "comfort",
          "usually",
          "most",
          "important",
          "thing",
          "would",
          "look",
          "price",
          "first",
          "have",
          "budget",
          "want"
        ],
        "tip": "",
        "id": "A2-C07-T04",
        "targetWords": 11,
        "everyday": "I’d look at the price first if I’ve a budget.",
        "reactive": false
      },
      {
        "prompt": "Think of a recent clothes purchase. Were you happy with it?",
        "options": [
          "Yes, my last purchase fitted well and I use it often.",
          "I bought a shirt recently, but the colour looked different at home.",
          "The last thing I bought was fine, although I had to change the size."
        ],
        "keywords": [
          "last",
          "purchase",
          "fitted",
          "well",
          "often",
          "bought",
          "shirt",
          "recently",
          "colour",
          "looked",
          "different",
          "home"
        ],
        "tip": "",
        "id": "A2-C07-T05",
        "targetWords": 12,
        "everyday": "My last purchase fitted well and I use it often.",
        "reactive": true
      },
      {
        "prompt": "What can make shopping for clothes difficult?",
        "options": [
          "Sizes can be different between brands.",
          "It is difficult when there are too many similar choices.",
          "I sometimes find it hard to judge how something will feel after wearing it."
        ],
        "keywords": [
          "sizes",
          "different",
          "between",
          "brands",
          "difficult",
          "when",
          "there",
          "many",
          "similar",
          "choices",
          "sometimes",
          "find"
        ],
        "tip": "",
        "id": "A2-C07-T06",
        "targetWords": 10,
        "everyday": "It’s difficult when there are too many similar choices.",
        "reactive": false
      },
      {
        "prompt": "If the size does not fit, what would you ask the shop assistant?",
        "options": [
          "Could I try the next size up, please?",
          "Do you have this in a different size?",
          "This one is a little tight. Could I try another one?"
        ],
        "keywords": [
          "could",
          "next",
          "size",
          "please",
          "have",
          "this",
          "different",
          "little",
          "tight",
          "another"
        ],
        "tip": "",
        "id": "A2-C07-T07",
        "targetWords": 9,
        "everyday": "Hey, could I try the next size up, please?",
        "reactive": false,
        "branches": [
          {
            "any": [
              "ask",
              "help",
              "check",
              "explain",
              "repeat"
            ],
            "prompt": "That sounds like a practical response. Do you prefer shopping alone or with another person?"
          }
        ]
      },
      {
        "prompt": "Do you prefer shopping alone or with another person?",
        "options": [
          "I usually shop alone because it is faster.",
          "I like having another person there to give an opinion.",
          "It depends: for basic items I go alone, but company can be useful."
        ],
        "keywords": [
          "usually",
          "shop",
          "alone",
          "because",
          "faster",
          "like",
          "having",
          "another",
          "person",
          "there",
          "give",
          "opinion"
        ],
        "tip": "",
        "id": "A2-C07-T08",
        "targetWords": 10,
        "everyday": "Personally, i usually shop alone because it is faster.",
        "reactive": true
      },
      {
        "prompt": "What would you check before buying clothes next time?",
        "options": [
          "I would check the size guide and return policy.",
          "I will think about what I actually need before I go.",
          "Next time I will compare the material and price more carefully."
        ],
        "keywords": [
          "would",
          "check",
          "size",
          "guide",
          "return",
          "policy",
          "will",
          "think",
          "about",
          "what",
          "actually",
          "need"
        ],
        "tip": "",
        "id": "A2-C07-T09",
        "targetWords": 10,
        "everyday": "I’d check the size guide and return policy.",
        "reactive": false
      },
      {
        "prompt": "You decide not to buy the item. What polite sentence could you use?",
        "options": [
          "Thanks, but I think I will leave it for today.",
          "It is nice, but I am not going to take it. Thank you.",
          "Thank you for your help. I need a little more time to decide."
        ],
        "keywords": [
          "thanks",
          "think",
          "will",
          "leave",
          "today",
          "nice",
          "going",
          "take",
          "thank",
          "your",
          "help",
          "need"
        ],
        "tip": "",
        "id": "A2-C07-T10",
        "targetWords": 12,
        "everyday": "It’s nice, but I’m not going to take it. Thanks.",
        "reactive": false
      }
    ],
    "canDo": "Buy clothing and handle size, colour and payment questions",
    "functions": [
      "shopping",
      "preferences",
      "transaction"
    ],
    "cefrFocus": "Routine spoken interaction"
  },
  {
    "id": "A2-C08",
    "level": "A2",
    "emoji": "✈️",
    "title": "Planning a short trip",
    "topic": "Travel plans",
    "estimatedMinutes": 4,
    "turns": [
      {
        "prompt": "You're planning a short break. Where would you like to go?",
        "options": [
          "I'd like to visit a quiet town in the mountains.",
          "I'd like to spend a few days somewhere with nature.",
          "I'd like to take a short trip to a place I haven't visited before."
        ],
        "keywords": [
          "i'd",
          "like",
          "visit",
          "quiet",
          "town",
          "mountains",
          "spend",
          "few",
          "days",
          "somewhere"
        ],
        "tip": "",
        "id": "A2-C08-T01",
        "targetWords": 11,
        "everyday": "Personally, i'd like to visit a quiet town in the mountains.",
        "reactive": false
      },
      {
        "prompt": "What extra detail would you decide before booking the trip?",
        "options": [
          "I would decide the dates and how much I want to spend.",
          "I would check where to stay before buying the tickets.",
          "I would first decide how many days I can travel."
        ],
        "keywords": [
          "would",
          "decide",
          "dates",
          "much",
          "want",
          "spend",
          "check",
          "where",
          "stay",
          "before",
          "buying",
          "tickets"
        ],
        "tip": "",
        "id": "A2-C08-T02",
        "targetWords": 11,
        "everyday": "I’d first decide how many days I can travel.",
        "reactive": true
      },
      {
        "prompt": "How often do you plan short trips or weekends away?",
        "options": [
          "I take a short trip a few times a year.",
          "Mostly on long weekends or during holidays.",
          "Not very often, but I like planning a short break when I can."
        ],
        "keywords": [
          "take",
          "short",
          "trip",
          "times",
          "year",
          "mostly",
          "long",
          "weekends",
          "during",
          "holidays",
          "very",
          "often"
        ],
        "tip": "",
        "id": "A2-C08-T03",
        "targetWords": 10,
        "everyday": "Personally, i take a short trip a few times a year.",
        "reactive": false,
        "branches": [
          {
            "any": [
              "often",
              "usually",
              "week",
              "daily",
              "regularly"
            ],
            "prompt": "Since this sounds fairly familiar to you, would you rather visit one place slowly or see several places quickly?"
          },
          {
            "any": [
              "not",
              "rarely",
              "never",
              "sometimes"
            ],
            "prompt": "If this is not something you do very often, would you rather visit one place slowly or see several places quickly?"
          }
        ]
      },
      {
        "prompt": "Would you rather visit one place slowly or see several places quickly?",
        "options": [
          "I would rather enjoy one place without rushing.",
          "I like seeing several places if they are close together.",
          "Usually I choose one main place and add one or two small visits."
        ],
        "keywords": [
          "would",
          "rather",
          "enjoy",
          "place",
          "without",
          "rushing",
          "like",
          "seeing",
          "several",
          "places",
          "they",
          "close"
        ],
        "tip": "",
        "id": "A2-C08-T04",
        "targetWords": 10,
        "everyday": "I’d rather enjoy one place without rushing.",
        "reactive": false
      },
      {
        "prompt": "Tell me about a short trip you enjoyed in the past.",
        "options": [
          "I once spent a weekend in a small town and really enjoyed walking around.",
          "My last short trip was relaxing because everything was close.",
          "I remember a weekend trip where we changed the plan because of rain."
        ],
        "keywords": [
          "once",
          "spent",
          "weekend",
          "small",
          "town",
          "really",
          "enjoyed",
          "walking",
          "around",
          "last",
          "short",
          "trip"
        ],
        "tip": "",
        "id": "A2-C08-T05",
        "targetWords": 12,
        "everyday": "Personally, i once spent a weekend in a small town and really enjoyed walking around.",
        "reactive": true
      },
      {
        "prompt": "What can make planning a short trip difficult?",
        "options": [
          "Prices can change quickly.",
          "Choosing transport and accommodation at the same time can be difficult.",
          "It is harder when everyone wants to do different activities."
        ],
        "keywords": [
          "prices",
          "change",
          "quickly",
          "choosing",
          "transport",
          "accommodation",
          "same",
          "time",
          "difficult",
          "harder",
          "when",
          "everyone"
        ],
        "tip": "",
        "id": "A2-C08-T06",
        "targetWords": 8,
        "everyday": "It’s harder when everyone wants to do different activities.",
        "reactive": false
      },
      {
        "prompt": "If your first transport option is too expensive, what would you do?",
        "options": [
          "I would compare another bus, train or flight.",
          "I would change the travel time if that made it cheaper.",
          "I might choose a closer destination and keep the same budget."
        ],
        "keywords": [
          "would",
          "compare",
          "another",
          "train",
          "flight",
          "change",
          "travel",
          "time",
          "that",
          "made",
          "cheaper",
          "might"
        ],
        "tip": "",
        "id": "A2-C08-T07",
        "targetWords": 10,
        "everyday": "I’d change the travel time if that made it cheaper.",
        "reactive": false,
        "branches": [
          {
            "any": [
              "ask",
              "help",
              "check",
              "explain",
              "repeat"
            ],
            "prompt": "That sounds like a practical response. Do you prefer travelling alone, with family or with friends?"
          }
        ]
      },
      {
        "prompt": "Do you prefer travelling alone, with family or with friends?",
        "options": [
          "I enjoy travelling with people I know well.",
          "I am comfortable travelling alone for a short trip.",
          "It depends on the purpose, but I usually prefer going with family or friends."
        ],
        "keywords": [
          "enjoy",
          "travelling",
          "with",
          "people",
          "know",
          "well",
          "comfortable",
          "alone",
          "short",
          "trip",
          "depends",
          "purpose"
        ],
        "tip": "",
        "id": "A2-C08-T08",
        "targetWords": 10,
        "everyday": "I’m comfortable travelling alone for a short trip.",
        "reactive": true
      },
      {
        "prompt": "What would you organise first for your next short trip?",
        "options": [
          "I would organise transport first.",
          "I would choose the accommodation and then plan activities.",
          "First I would set a budget and confirm the dates."
        ],
        "keywords": [
          "would",
          "organise",
          "transport",
          "first",
          "choose",
          "accommodation",
          "then",
          "plan",
          "activities",
          "budget",
          "confirm",
          "dates"
        ],
        "tip": "",
        "id": "A2-C08-T09",
        "targetWords": 8,
        "everyday": "I’d organise transport first.",
        "reactive": false
      },
      {
        "prompt": "You need information before booking. What question could you ask?",
        "options": [
          "Is breakfast included in the price?",
          "Can I change the booking if my plans change?",
          "What is the easiest way to get there from the station?"
        ],
        "keywords": [
          "breakfast",
          "included",
          "price",
          "change",
          "booking",
          "plans",
          "what",
          "easiest",
          "there",
          "from",
          "station"
        ],
        "tip": "",
        "id": "A2-C08-T10",
        "targetWords": 9,
        "everyday": "Hey, is breakfast included in the price?",
        "reactive": false
      }
    ],
    "canDo": "Plan a short trip using simple connected language",
    "functions": [
      "travel",
      "plans",
      "choices"
    ],
    "cefrFocus": "Routine spoken interaction"
  },
  {
    "id": "A2-C09",
    "level": "A2",
    "emoji": "💼",
    "title": "Talking about a workday",
    "topic": "Work and study",
    "estimatedMinutes": 4,
    "turns": [
      {
        "prompt": "Someone asks how your workday usually goes. What do you say?",
        "options": [
          "I usually start early and have several tasks during the day.",
          "My workday is busy, but I try to organise my time well.",
          "I work with different people and usually have a full schedule."
        ],
        "keywords": [
          "usually",
          "start",
          "early",
          "several",
          "tasks",
          "during",
          "day",
          "workday",
          "busy",
          "try"
        ],
        "tip": "",
        "id": "A2-C09-T01",
        "targetWords": 11,
        "everyday": "Personally, i usually start early and have several tasks during the day.",
        "reactive": false
      },
      {
        "prompt": "What is one more detail about your normal work or study routine?",
        "options": [
          "I usually check my messages and organise my tasks first.",
          "I have a short break in the middle of the day when possible.",
          "I try to keep one part of the day for focused work."
        ],
        "keywords": [
          "usually",
          "check",
          "messages",
          "organise",
          "tasks",
          "first",
          "have",
          "short",
          "break",
          "middle",
          "when",
          "possible"
        ],
        "tip": "",
        "id": "A2-C09-T02",
        "targetWords": 12,
        "everyday": "I’ve a short break in the middle of the day when possible.",
        "reactive": true
      },
      {
        "prompt": "How often do you have a particularly busy day?",
        "options": [
          "I have a very busy day once or twice a week.",
          "Some weeks are calm and others are much busier.",
          "I am usually busiest when several deadlines come together."
        ],
        "keywords": [
          "have",
          "very",
          "busy",
          "once",
          "twice",
          "week",
          "some",
          "weeks",
          "calm",
          "others",
          "much",
          "busier"
        ],
        "tip": "",
        "id": "A2-C09-T03",
        "targetWords": 10,
        "everyday": "I’ve a very busy day once or twice a week.",
        "reactive": false,
        "branches": [
          {
            "any": [
              "often",
              "usually",
              "week",
              "daily",
              "regularly"
            ],
            "prompt": "Since this sounds fairly familiar to you, do you prefer starting with easy tasks or the most important task?"
          },
          {
            "any": [
              "not",
              "rarely",
              "never",
              "sometimes"
            ],
            "prompt": "If this is not something you do very often, do you prefer starting with easy tasks or the most important task?"
          }
        ]
      },
      {
        "prompt": "Do you prefer starting with easy tasks or the most important task?",
        "options": [
          "I prefer starting with the most important task.",
          "I like doing one quick task first and then focusing on the difficult one.",
          "It depends on my energy, but I try not to leave important work until late."
        ],
        "keywords": [
          "prefer",
          "starting",
          "with",
          "most",
          "important",
          "task",
          "like",
          "doing",
          "quick",
          "first",
          "then",
          "focusing"
        ],
        "tip": "",
        "id": "A2-C09-T04",
        "targetWords": 12,
        "everyday": "I’d rather starting with the most important task.",
        "reactive": false
      },
      {
        "prompt": "Tell me about a work or study day that went especially well.",
        "options": [
          "One day went well because I finished an important task earlier than expected.",
          "I remember a day when everything was organised and I had time to concentrate.",
          "Recently I had a productive day because I avoided unnecessary interruptions."
        ],
        "keywords": [
          "went",
          "well",
          "because",
          "finished",
          "important",
          "task",
          "earlier",
          "than",
          "expected",
          "remember",
          "when",
          "everything"
        ],
        "tip": "",
        "id": "A2-C09-T05",
        "targetWords": 13,
        "everyday": "Personally, one day went well because I finished an important task earlier than expected.",
        "reactive": true
      },
      {
        "prompt": "What can make your normal day difficult?",
        "options": [
          "Interruptions can make it hard to concentrate.",
          "It is difficult when several people need something at the same time.",
          "A busy schedule can be stressful if I do not have clear priorities."
        ],
        "keywords": [
          "interruptions",
          "make",
          "hard",
          "concentrate",
          "difficult",
          "when",
          "several",
          "people",
          "need",
          "something",
          "same",
          "time"
        ],
        "tip": "",
        "id": "A2-C09-T06",
        "targetWords": 11,
        "everyday": "It’s difficult when several people need something at the same time.",
        "reactive": false
      },
      {
        "prompt": "If you have too many tasks at once, what do you usually do?",
        "options": [
          "I make a short list and decide what is most urgent.",
          "I try to finish one thing before starting another.",
          "I ask for clarification if two tasks seem equally urgent."
        ],
        "keywords": [
          "make",
          "short",
          "list",
          "decide",
          "what",
          "most",
          "urgent",
          "finish",
          "thing",
          "before",
          "starting",
          "another"
        ],
        "tip": "",
        "id": "A2-C09-T07",
        "targetWords": 10,
        "everyday": "Personally, i make a short list and decide what is most urgent.",
        "reactive": false,
        "branches": [
          {
            "any": [
              "ask",
              "help",
              "check",
              "explain",
              "repeat"
            ],
            "prompt": "That sounds like a practical response. Do you work or study better alone or with other people nearby?"
          }
        ]
      },
      {
        "prompt": "Do you work or study better alone or with other people nearby?",
        "options": [
          "I usually concentrate better alone.",
          "I like working near other people as long as the space is not noisy.",
          "For focused tasks I prefer being alone, but teamwork is useful for some activities."
        ],
        "keywords": [
          "usually",
          "concentrate",
          "better",
          "alone",
          "like",
          "working",
          "near",
          "other",
          "people",
          "long",
          "space",
          "noisy"
        ],
        "tip": "",
        "id": "A2-C09-T08",
        "targetWords": 11,
        "everyday": "Personally, i usually concentrate better alone.",
        "reactive": true
      },
      {
        "prompt": "What small change could make your next busy day easier?",
        "options": [
          "I could prepare my priorities the night before.",
          "I would protect one quiet block of time for the most important task.",
          "Next time I will leave a little more space between meetings or activities."
        ],
        "keywords": [
          "could",
          "prepare",
          "priorities",
          "night",
          "before",
          "would",
          "protect",
          "quiet",
          "block",
          "time",
          "most",
          "important"
        ],
        "tip": "",
        "id": "A2-C09-T09",
        "targetWords": 11,
        "everyday": "I’d protect one quiet block of time for the most important task.",
        "reactive": false
      },
      {
        "prompt": "You need more time for a task. What useful sentence could you say?",
        "options": [
          "Could I have a little more time to finish this properly?",
          "I may need until tomorrow to complete this task. Is that okay?",
          "Could we confirm which task is the priority today?"
        ],
        "keywords": [
          "could",
          "have",
          "little",
          "more",
          "time",
          "finish",
          "this",
          "properly",
          "need",
          "until",
          "tomorrow",
          "complete"
        ],
        "tip": "",
        "id": "A2-C09-T10",
        "targetWords": 11,
        "everyday": "Could I’ve a little more time to finish this properly?",
        "reactive": false
      }
    ],
    "canDo": "Describe a normal work or study day and simple difficulties",
    "functions": [
      "work",
      "routine",
      "problem solving"
    ],
    "cefrFocus": "Routine spoken interaction"
  },
  {
    "id": "A2-C10",
    "level": "A2",
    "emoji": "📞",
    "title": "A practical phone call",
    "topic": "Phone conversations",
    "estimatedMinutes": 4,
    "turns": [
      {
        "prompt": "You're calling to change an appointment. How do you start?",
        "options": [
          "Hello, I'm calling because I'd like to change my appointment.",
          "Hi, I have an appointment tomorrow and I need to reschedule it.",
          "Good morning. Could I change the time of my appointment, please?"
        ],
        "keywords": [
          "hello",
          "i'm",
          "calling",
          "because",
          "i'd",
          "like",
          "change",
          "appointment",
          "tomorrow",
          "need"
        ],
        "tip": "",
        "id": "A2-C10-T01",
        "targetWords": 11,
        "everyday": "Hi, I’ve an appointment tomorrow and I need to reschedule it.",
        "reactive": false
      },
      {
        "prompt": "The person answers the phone. What key detail would you confirm first?",
        "options": [
          "I would confirm that I am speaking to the right department.",
          "First I would check the booking or reference number.",
          "I would say my name and explain briefly why I am calling."
        ],
        "keywords": [
          "would",
          "confirm",
          "that",
          "speaking",
          "right",
          "department",
          "first",
          "check",
          "booking",
          "reference",
          "number",
          "name"
        ],
        "tip": "",
        "id": "A2-C10-T02",
        "targetWords": 11,
        "everyday": "First I’d check the booking or reference number.",
        "reactive": true
      },
      {
        "prompt": "How often do you make practical phone calls in English or another language?",
        "options": [
          "Not very often, but I sometimes need to make practical calls.",
          "I make these calls when I need to confirm an appointment or booking.",
          "I usually prefer messages, so phone calls are less frequent for me."
        ],
        "keywords": [
          "very",
          "often",
          "sometimes",
          "need",
          "make",
          "practical",
          "calls",
          "these",
          "when",
          "confirm",
          "appointment",
          "booking"
        ],
        "tip": "",
        "id": "A2-C10-T03",
        "targetWords": 12,
        "everyday": "I’d usually go with messages, so phone calls are less frequent for me.",
        "reactive": false,
        "branches": [
          {
            "any": [
              "often",
              "usually",
              "week",
              "daily",
              "regularly"
            ],
            "prompt": "Since this sounds fairly familiar to you, would you rather call someone or send a message for a simple request?"
          },
          {
            "any": [
              "not",
              "rarely",
              "never",
              "sometimes"
            ],
            "prompt": "If this is not something you do very often, would you rather call someone or send a message for a simple request?"
          }
        ]
      },
      {
        "prompt": "Would you rather call someone or send a message for a simple request?",
        "options": [
          "I prefer sending a message for simple information.",
          "I would call if I needed an answer quickly.",
          "Messages are easier for details, but a call can solve a problem faster."
        ],
        "keywords": [
          "prefer",
          "sending",
          "message",
          "simple",
          "information",
          "would",
          "call",
          "needed",
          "answer",
          "quickly",
          "messages",
          "easier"
        ],
        "tip": "",
        "id": "A2-C10-T04",
        "targetWords": 10,
        "everyday": "I’d rather sending a message for simple information.",
        "reactive": false
      },
      {
        "prompt": "Tell me about a phone call where you had to repeat or clarify information.",
        "options": [
          "Once I had to repeat an address because the connection was poor.",
          "I remember spelling my name several times during a booking call.",
          "On one call, I asked the person to repeat a time because I was not sure I heard it correctly."
        ],
        "keywords": [
          "once",
          "repeat",
          "address",
          "because",
          "connection",
          "poor",
          "remember",
          "spelling",
          "name",
          "several",
          "times",
          "during"
        ],
        "tip": "",
        "id": "A2-C10-T05",
        "targetWords": 14,
        "everyday": "Personally, once I had to repeat an address because the connection was poor.",
        "reactive": true
      },
      {
        "prompt": "What can make a practical phone call difficult?",
        "options": [
          "It is difficult when the connection is bad.",
          "Phone calls are harder because I cannot see the other person.",
          "Names, numbers and times can be easy to misunderstand."
        ],
        "keywords": [
          "difficult",
          "when",
          "connection",
          "phone",
          "calls",
          "harder",
          "because",
          "cannot",
          "other",
          "person",
          "names",
          "numbers"
        ],
        "tip": "",
        "id": "A2-C10-T06",
        "targetWords": 9,
        "everyday": "It’s difficult when the connection is bad.",
        "reactive": false
      },
      {
        "prompt": "If you cannot hear the other person clearly, what would you say?",
        "options": [
          "Sorry, the line is not very clear. Could you repeat that?",
          "Could you say the last number again, please?",
          "I am sorry, I did not catch that. Could you speak a little more slowly?"
        ],
        "keywords": [
          "sorry",
          "line",
          "very",
          "clear",
          "could",
          "repeat",
          "that",
          "last",
          "number",
          "again",
          "please",
          "catch"
        ],
        "tip": "",
        "id": "A2-C10-T07",
        "targetWords": 11,
        "everyday": "Can you say the last number again, please?",
        "reactive": false,
        "branches": [
          {
            "any": [
              "ask",
              "help",
              "check",
              "explain",
              "repeat"
            ],
            "prompt": "That sounds like a practical response. Do you prefer making an important call alone or having information written in front of you?"
          }
        ]
      },
      {
        "prompt": "Do you prefer making an important call alone or having information written in front of you?",
        "options": [
          "I like having the important information written in front of me.",
          "I am fine making the call alone if I know what I need to ask.",
          "For an important call, I prepare notes first even if I call by myself."
        ],
        "keywords": [
          "like",
          "having",
          "important",
          "information",
          "written",
          "front",
          "fine",
          "making",
          "call",
          "alone",
          "know",
          "what"
        ],
        "tip": "",
        "id": "A2-C10-T08",
        "targetWords": 13,
        "everyday": "I’m fine making the call alone if I know what I need to ask.",
        "reactive": true
      },
      {
        "prompt": "What could you prepare before your next practical phone call?",
        "options": [
          "I would write down names, numbers and my main question.",
          "I could prepare a short opening sentence before I call.",
          "I would keep the booking or account details next to me."
        ],
        "keywords": [
          "would",
          "write",
          "down",
          "names",
          "numbers",
          "main",
          "question",
          "could",
          "prepare",
          "short",
          "opening",
          "sentence"
        ],
        "tip": "",
        "id": "A2-C10-T09",
        "targetWords": 10,
        "everyday": "I’d keep the booking or account details next to me.",
        "reactive": false
      },
      {
        "prompt": "You are ready to end the call. What useful closing sentence could you use?",
        "options": [
          "Thank you for your help. Have a good day.",
          "Great, that answers my question. Thank you.",
          "Thanks for confirming everything. Goodbye."
        ],
        "keywords": [
          "thank",
          "your",
          "help",
          "have",
          "good",
          "great",
          "that",
          "answers",
          "question",
          "thanks",
          "confirming",
          "everything"
        ],
        "tip": "",
        "id": "A2-C10-T10",
        "targetWords": 7,
        "everyday": "Thanks for your help. Have a good day.",
        "reactive": false
      }
    ],
    "canDo": "Make a practical phone call and confirm key information",
    "functions": [
      "phone",
      "clarify",
      "requests"
    ],
    "cefrFocus": "Routine spoken interaction"
  },
{
  "id": "A2-C11",
  "level": "A2",
  "emoji": "🏫",
  "title": "Joining a class",
  "topic": "Education",
  "estimatedMinutes": 4,
  "canDo": "Enrol in a course and ask about schedule and level",
  "functions": [
    "education",
    "enrolling",
    "requests"
  ],
  "cefrFocus": "Routine spoken interaction",
  "turns": [
    {
      "prompt": "Good morning. How can I help you?",
      "options": [
        "Hi, I'd like to join an English class.",
        "Hello, I want to sign up for a class.",
        "Hi, I'm interested in an English course."
      ],
      "keywords": [
        "hi",
        "i'd",
        "like",
        "to",
        "join",
        "an",
        "english",
        "class",
        "hello",
        "i",
        "want",
        "sign"
      ],
      "tip": "",
      "id": "A2-C11-T01",
      "targetWords": 7,
      "everyday": "Hey, I want to sign up for English classes.",
      "reactive": false
    },
    {
      "prompt": "What level are you at the moment?",
      "options": [
        "I think I'm at an intermediate level.",
        "I'm not sure, maybe pre-intermediate.",
        "I'm a beginner, I think."
      ],
      "keywords": [
        "i",
        "think",
        "i'm",
        "at",
        "an",
        "intermediate",
        "level",
        "not",
        "sure",
        "maybe",
        "pre",
        "a"
      ],
      "tip": "",
      "id": "A2-C11-T02",
      "targetWords": 8,
      "everyday": "Somewhere around pre-intermediate, I think.",
      "reactive": false,
      "openAnswer": true
    },
    {
      "prompt": "We can also do a short test to check your level. Is that okay?",
      "options": [
        "Yes, that's a good idea.",
        "Sure, no problem at all.",
        "Yes, that sounds useful."
      ],
      "keywords": [
        "yes",
        "that's",
        "a",
        "good",
        "idea",
        "sure",
        "no",
        "problem",
        "at",
        "all",
        "that",
        "sounds"
      ],
      "tip": "",
      "id": "A2-C11-T03",
      "targetWords": 6,
      "everyday": "Yeah, sounds good.",
      "reactive": false
    },
    {
      "prompt": "What days would work best for you?",
      "options": [
        "Evenings would be best for me.",
        "I prefer weekday mornings.",
        "Weekends work better for me."
      ],
      "keywords": [
        "evenings",
        "would",
        "be",
        "best",
        "for",
        "me",
        "i",
        "prefer",
        "weekday",
        "mornings",
        "weekends",
        "work"
      ],
      "tip": "",
      "id": "A2-C11-T04",
      "targetWords": 7,
      "everyday": "Evenings work best, honestly.",
      "reactive": false,
      "openAnswer": true
    },
    {
      "prompt": "Classes are on Tuesdays and Thursdays at seven. Does that suit you?",
      "options": [
        "Yes, that suits me perfectly.",
        "That should be fine for me.",
        "Yes, I can manage that."
      ],
      "keywords": [
        "yes",
        "that",
        "suits",
        "me",
        "perfectly",
        "should",
        "be",
        "fine",
        "for",
        "i",
        "can",
        "manage"
      ],
      "tip": "",
      "id": "A2-C11-T05",
      "targetWords": 6,
      "everyday": "Perfect, that works.",
      "reactive": true
    },
    {
      "prompt": "How many people are usually in a class?",
      "options": [
        "Around eight or ten people, I think.",
        "I imagine about ten students.",
        "Not sure, maybe a small group."
      ],
      "keywords": [
        "around",
        "eight",
        "or",
        "ten",
        "people",
        "i",
        "think",
        "imagine",
        "about",
        "students",
        "not",
        "sure"
      ],
      "tip": "",
      "id": "A2-C11-T06",
      "targetWords": 8,
      "everyday": "Maybe eight or ten, not sure exactly.",
      "reactive": false,
      "openAnswer": true
    },
    {
      "prompt": "Do you need any materials for the first class?",
      "options": [
        "Just a notebook and a pen, I think.",
        "I'm not sure, could you tell me?",
        "Maybe a notebook, right?"
      ],
      "keywords": [
        "just",
        "a",
        "notebook",
        "and",
        "pen",
        "i",
        "think",
        "i'm",
        "not",
        "sure",
        "could",
        "you"
      ],
      "tip": "",
      "id": "A2-C11-T07",
      "targetWords": 8,
      "everyday": "Not sure, actually — what do I need?",
      "reactive": true
    },
    {
      "prompt": "The first class is next Tuesday. Can you come?",
      "options": [
        "Yes, I can come next Tuesday.",
        "Yes, that works for me.",
        "Yes, I'll be there."
      ],
      "keywords": [
        "yes",
        "i",
        "can",
        "come",
        "next",
        "tuesday",
        "that",
        "works",
        "for",
        "me",
        "i'll",
        "be"
      ],
      "tip": "",
      "id": "A2-C11-T08",
      "targetWords": 6,
      "everyday": "Yep, Tuesday's fine.",
      "reactive": false
    },
    {
      "prompt": "Would you like to receive updates by email?",
      "options": [
        "Yes, please, that would help.",
        "Yes, my email is fine for that.",
        "No, thank you, that's fine."
      ],
      "keywords": [
        "yes",
        "please",
        "that",
        "would",
        "help",
        "my",
        "email",
        "is",
        "fine",
        "for",
        "no",
        "thank"
      ],
      "tip": "",
      "id": "A2-C11-T09",
      "targetWords": 7,
      "everyday": "Sure, that'd be handy.",
      "reactive": false
    },
    {
      "prompt": "Great, welcome to the class! Anything else you'd like to ask?",
      "options": [
        "No, thank you for your help.",
        "Just one thing — where is the classroom?",
        "No, I think that's everything."
      ],
      "keywords": [
        "no",
        "thank",
        "you",
        "for",
        "your",
        "help",
        "just",
        "one",
        "thing",
        "where",
        "is",
        "the"
      ],
      "tip": "",
      "id": "A2-C11-T10",
      "targetWords": 7,
      "everyday": "Just one thing — where's the classroom?",
      "reactive": true
    }
  ]
},
{
  "id": "A2-C12",
  "level": "A2",
  "emoji": "📞",
  "title": "Calling in sick to work",
  "topic": "Work situations",
  "estimatedMinutes": 4,
  "canDo": "Make a simple work call about being unwell and confirm next steps",
  "functions": [
    "work",
    "phone",
    "explaining"
  ],
  "cefrFocus": "Routine spoken interaction",
  "turns": [
    {
      "prompt": "Hello, this is the office. How can I help?",
      "options": [
        "Hi, I'm calling because I'm feeling unwell.",
        "Hello, I'm not feeling well today.",
        "Hi, I need to talk about today."
      ],
      "keywords": [
        "hi",
        "i'm",
        "calling",
        "because",
        "feeling",
        "unwell",
        "hello",
        "not",
        "well",
        "today",
        "i",
        "need"
      ],
      "tip": "",
      "id": "A2-C12-T01",
      "targetWords": 7,
      "everyday": "Hi, just calling to say I'm not feeling great.",
      "reactive": false
    },
    {
      "prompt": "I'm sorry to hear that. What's wrong?",
      "options": [
        "I have a bad headache and a fever.",
        "I think I have a cold.",
        "I'm feeling very tired and unwell."
      ],
      "keywords": [
        "i",
        "have",
        "a",
        "bad",
        "headache",
        "and",
        "fever",
        "think",
        "cold",
        "i'm",
        "feeling",
        "very"
      ],
      "tip": "",
      "id": "A2-C12-T02",
      "targetWords": 7,
      "everyday": "Think I'm coming down with something.",
      "reactive": false,
      "openAnswer": true
    },
    {
      "prompt": "Do you think you'll be able to come in tomorrow?",
      "options": [
        "I hope so, I'll let you know.",
        "I'm not sure yet, honestly.",
        "I think I'll be fine tomorrow."
      ],
      "keywords": [
        "i",
        "hope",
        "so",
        "i'll",
        "let",
        "you",
        "know",
        "i'm",
        "not",
        "sure",
        "yet",
        "honestly"
      ],
      "tip": "",
      "id": "A2-C12-T03",
      "targetWords": 7,
      "everyday": "Not sure yet, honestly, I'll see how it goes.",
      "reactive": true,
      "openAnswer": true
    },
    {
      "prompt": "No problem. Do you have any meetings today?",
      "options": [
        "Yes, I have a meeting at ten.",
        "No, I don't have any today.",
        "Yes, but it can wait."
      ],
      "keywords": [
        "yes",
        "i",
        "have",
        "a",
        "meeting",
        "at",
        "ten",
        "no",
        "don't",
        "any",
        "today",
        "but"
      ],
      "tip": "",
      "id": "A2-C12-T04",
      "targetWords": 6,
      "everyday": "Yeah, one at ten.",
      "reactive": false,
      "openAnswer": true
    },
    {
      "prompt": "I can move that meeting for you. Is that okay?",
      "options": [
        "Yes, that would really help.",
        "Yes, please, thank you.",
        "That's very kind, thank you."
      ],
      "keywords": [
        "yes",
        "that",
        "would",
        "really",
        "help",
        "please",
        "thank",
        "you",
        "that's",
        "very",
        "kind"
      ],
      "tip": "",
      "id": "A2-C12-T05",
      "targetWords": 6,
      "everyday": "That'd really help, thanks.",
      "reactive": false
    },
    {
      "prompt": "Do you need anything from us while you rest?",
      "options": [
        "No, I just need some rest.",
        "No, I think I'm okay, thanks.",
        "Just some time to recover, thanks."
      ],
      "keywords": [
        "no",
        "i",
        "just",
        "need",
        "some",
        "rest",
        "think",
        "i'm",
        "okay",
        "thanks",
        "time",
        "to"
      ],
      "tip": "",
      "id": "A2-C12-T06",
      "targetWords": 6,
      "everyday": "Just need to rest, that's all.",
      "reactive": false
    },
    {
      "prompt": "Should I tell the rest of the team?",
      "options": [
        "Yes, please, that would help.",
        "Yes, could you let them know?",
        "Yes, that would be great, thanks."
      ],
      "keywords": [
        "yes",
        "please",
        "that",
        "would",
        "help",
        "could",
        "you",
        "let",
        "them",
        "know",
        "be",
        "great"
      ],
      "tip": "",
      "id": "A2-C12-T07",
      "targetWords": 6,
      "everyday": "Yeah, could you tell them for me?",
      "reactive": false
    },
    {
      "prompt": "Take care, and rest well.",
      "options": [
        "Thank you, I really appreciate it.",
        "Thanks a lot, see you soon.",
        "Thank you, I will."
      ],
      "keywords": [
        "thank",
        "you",
        "i",
        "really",
        "appreciate",
        "it",
        "thanks",
        "a",
        "lot",
        "see",
        "soon",
        "will"
      ],
      "tip": "",
      "id": "A2-C12-T08",
      "targetWords": 5,
      "everyday": "Cheers, see you soon.",
      "reactive": false
    },
    {
      "prompt": "Let us know how you feel tomorrow morning.",
      "options": [
        "I will, thank you.",
        "Sure, I'll send a message.",
        "Of course, I'll call in the morning."
      ],
      "keywords": [
        "i",
        "will",
        "thank",
        "you",
        "sure",
        "i'll",
        "send",
        "a",
        "message",
        "of",
        "course",
        "call"
      ],
      "tip": "",
      "id": "A2-C12-T09",
      "targetWords": 6,
      "everyday": "Sure, I'll text you.",
      "reactive": false
    },
    {
      "prompt": "Feel better soon!",
      "options": [
        "Thank you very much.",
        "Thanks, I hope so too.",
        "Thank you, bye for now."
      ],
      "keywords": [
        "thank",
        "you",
        "very",
        "much",
        "thanks",
        "i",
        "hope",
        "so",
        "too",
        "bye",
        "for",
        "now"
      ],
      "tip": "",
      "id": "A2-C12-T10",
      "targetWords": 5,
      "everyday": "Thanks, hope so too.",
      "reactive": false
    }
  ]
},
{
  "id": "A2-C13",
  "level": "A2",
  "emoji": "🧾",
  "title": "A mix-up with a booking",
  "topic": "Problem solving",
  "estimatedMinutes": 4,
  "canDo": "Cope with a mix-up over a booking and ask for it to be corrected",
  "functions": [
    "problem solving",
    "clarifying",
    "requests"
  ],
  "cefrFocus": "Routine spoken interaction",
  "turns": [
    {
      "prompt": "Hello, how can I help you today?",
      "options": [
        "Hi, I think there's a problem with my booking.",
        "Hello, my booking doesn't look right.",
        "Hi, I need to check something about my reservation."
      ],
      "keywords": [
        "hi",
        "i",
        "think",
        "there's",
        "a",
        "problem",
        "with",
        "my",
        "booking",
        "hello",
        "doesn't",
        "look"
      ],
      "tip": "",
      "id": "A2-C13-T01",
      "targetWords": 8,
      "everyday": "Hi, something's off with my booking.",
      "reactive": false
    },
    {
      "prompt": "I'm sorry to hear that. What seems to be wrong?",
      "options": [
        "The date on my booking is wrong.",
        "I booked for two people, not one.",
        "The booking shows the wrong room."
      ],
      "keywords": [
        "the",
        "date",
        "on",
        "my",
        "booking",
        "is",
        "wrong",
        "i",
        "booked",
        "for",
        "two",
        "people"
      ],
      "tip": "",
      "id": "A2-C13-T02",
      "targetWords": 7,
      "everyday": "The date's wrong on it.",
      "reactive": false,
      "openAnswer": true
    },
    {
      "prompt": "Let me check that for you. Do you have a booking number?",
      "options": [
        "Yes, one moment, please.",
        "Yes, I have it here.",
        "Yes, let me find it."
      ],
      "keywords": [
        "yes",
        "one",
        "moment",
        "please",
        "i",
        "have",
        "it",
        "here",
        "let",
        "me",
        "find"
      ],
      "tip": "",
      "id": "A2-C13-T03",
      "targetWords": 5,
      "everyday": "Yep, got it right here.",
      "reactive": false
    },
    {
      "prompt": "Thanks. I can see the mistake now. I'll fix it for you.",
      "options": [
        "Thank you so much for checking.",
        "That's a big help, thank you.",
        "Great, thank you very much."
      ],
      "keywords": [
        "thank",
        "you",
        "so",
        "much",
        "for",
        "checking",
        "that's",
        "a",
        "big",
        "help",
        "great",
        "very"
      ],
      "tip": "",
      "id": "A2-C13-T04",
      "targetWords": 6,
      "everyday": "That's a huge help, thanks.",
      "reactive": true
    },
    {
      "prompt": "Is there anything else that isn't correct?",
      "options": [
        "No, I think that was the only thing.",
        "Actually, yes, one more detail.",
        "No, that's everything, thank you."
      ],
      "keywords": [
        "no",
        "i",
        "think",
        "that",
        "was",
        "the",
        "only",
        "thing",
        "actually",
        "yes",
        "one",
        "more"
      ],
      "tip": "",
      "id": "A2-C13-T05",
      "targetWords": 7,
      "everyday": "Nope, that was the only thing.",
      "reactive": true
    },
    {
      "prompt": "It's fixed now. Can you check the details, please?",
      "options": [
        "Yes, that looks correct now.",
        "Yes, everything looks fine now.",
        "Yes, this is right, thank you."
      ],
      "keywords": [
        "yes",
        "that",
        "looks",
        "correct",
        "now",
        "everything",
        "fine",
        "this",
        "is",
        "right",
        "thank",
        "you"
      ],
      "tip": "",
      "id": "A2-C13-T06",
      "targetWords": 6,
      "everyday": "Yep, looks right now.",
      "reactive": false
    },
    {
      "prompt": "Would you like a confirmation by email?",
      "options": [
        "Yes, please, that would help.",
        "Yes, that would be useful, thanks.",
        "No, that's not necessary, thanks."
      ],
      "keywords": [
        "yes",
        "please",
        "that",
        "would",
        "help",
        "be",
        "useful",
        "thanks",
        "no",
        "that's",
        "not",
        "necessary"
      ],
      "tip": "",
      "id": "A2-C13-T07",
      "targetWords": 6,
      "everyday": "Sure, that'd be great, thanks.",
      "reactive": false
    },
    {
      "prompt": "I'm sorry again for the confusion.",
      "options": [
        "That's okay, thank you for fixing it.",
        "No problem, thank you for your help.",
        "It's fine, thanks for sorting it out."
      ],
      "keywords": [
        "that's",
        "okay",
        "thank",
        "you",
        "for",
        "fixing",
        "it",
        "no",
        "problem",
        "your",
        "help",
        "it's"
      ],
      "tip": "",
      "id": "A2-C13-T08",
      "targetWords": 7,
      "everyday": "No worries, thanks for sorting it.",
      "reactive": false
    },
    {
      "prompt": "Is there anything else I can help you with?",
      "options": [
        "No, that's everything, thank you.",
        "No, that's all for now, thanks.",
        "Just one more small question."
      ],
      "keywords": [
        "no",
        "that's",
        "everything",
        "thank",
        "you",
        "all",
        "for",
        "now",
        "thanks",
        "just",
        "one",
        "more"
      ],
      "tip": "",
      "id": "A2-C13-T09",
      "targetWords": 6,
      "everyday": "Nope, all good, thanks.",
      "reactive": true
    },
    {
      "prompt": "Have a great day, and sorry again!",
      "options": [
        "Thank you, you too.",
        "Thanks, no problem at all.",
        "Thank you, take care."
      ],
      "keywords": [
        "thank",
        "you",
        "too",
        "thanks",
        "no",
        "problem",
        "at",
        "all",
        "take",
        "care"
      ],
      "tip": "",
      "id": "A2-C13-T10",
      "targetWords": 5,
      "everyday": "Cheers, no worries at all.",
      "reactive": false
    }
  ]
},
{
  "id": "A2-C14",
  "level": "A2",
  "emoji": "🎬",
  "title": "Talking about a film or book",
  "topic": "Opinions",
  "estimatedMinutes": 4,
  "canDo": "Give a simple opinion about a film or book and explain why",
  "functions": [
    "opinion",
    "describing",
    "recommending"
  ],
  "cefrFocus": "Routine spoken interaction",
  "turns": [
    {
      "prompt": "Have you watched or read anything good recently?",
      "options": [
        "Yes, I watched a good film last week.",
        "Yes, I'm reading an interesting book.",
        "Yes, I saw a great film recently."
      ],
      "keywords": [
        "yes",
        "i",
        "watched",
        "a",
        "good",
        "film",
        "last",
        "week",
        "i'm",
        "reading",
        "an",
        "interesting"
      ],
      "tip": "",
      "id": "A2-C14-T01",
      "targetWords": 8,
      "everyday": "Yeah, caught a good film last week.",
      "reactive": false,
      "openAnswer": true
    },
    {
      "prompt": "What was it about?",
      "options": [
        "It was about a family and their problems.",
        "It was about a journey to a new city.",
        "It was about someone starting a new life."
      ],
      "keywords": [
        "it",
        "was",
        "about",
        "a",
        "family",
        "and",
        "their",
        "problems",
        "journey",
        "to",
        "new",
        "city"
      ],
      "tip": "",
      "id": "A2-C14-T02",
      "targetWords": 8,
      "everyday": "Basically about a family and their problems.",
      "reactive": true,
      "openAnswer": true
    },
    {
      "prompt": "Did you like it?",
      "options": [
        "Yes, I really enjoyed it.",
        "Yes, I liked it a lot.",
        "It was good, but a bit long."
      ],
      "keywords": [
        "yes",
        "i",
        "really",
        "enjoyed",
        "it",
        "liked",
        "a",
        "lot",
        "was",
        "good",
        "but",
        "bit"
      ],
      "tip": "",
      "id": "A2-C14-T03",
      "targetWords": 6,
      "everyday": "Yeah, really enjoyed it.",
      "reactive": false,
      "openAnswer": true
    },
    {
      "prompt": "What did you like most about it?",
      "options": [
        "I liked the characters the most.",
        "I liked the story the most.",
        "I liked how it ended."
      ],
      "keywords": [
        "i",
        "liked",
        "the",
        "characters",
        "most",
        "story",
        "how",
        "it",
        "ended"
      ],
      "tip": "",
      "id": "A2-C14-T04",
      "targetWords": 6,
      "everyday": "Mainly the characters, honestly.",
      "reactive": true,
      "openAnswer": true
    },
    {
      "prompt": "Was there anything you didn't like?",
      "options": [
        "It was a little slow at times.",
        "The ending was a bit confusing.",
        "No, I liked everything, actually."
      ],
      "keywords": [
        "it",
        "was",
        "a",
        "little",
        "slow",
        "at",
        "times",
        "the",
        "ending",
        "bit",
        "confusing",
        "no"
      ],
      "tip": "",
      "id": "A2-C14-T05",
      "targetWords": 7,
      "everyday": "Dragged a bit in places.",
      "reactive": false,
      "openAnswer": true
    },
    {
      "prompt": "Would you recommend it to a friend?",
      "options": [
        "Yes, I would recommend it.",
        "Yes, definitely, it's very good.",
        "Maybe, if they like that type of story."
      ],
      "keywords": [
        "yes",
        "i",
        "would",
        "recommend",
        "it",
        "definitely",
        "it's",
        "very",
        "good",
        "maybe",
        "if",
        "they"
      ],
      "tip": "",
      "id": "A2-C14-T06",
      "targetWords": 6,
      "everyday": "Yeah, definitely worth watching.",
      "reactive": false,
      "openAnswer": true
    },
    {
      "prompt": "What type of films or books do you usually like?",
      "options": [
        "I usually like comedies.",
        "I prefer real stories.",
        "I like mysteries and thrillers."
      ],
      "keywords": [
        "i",
        "usually",
        "like",
        "comedies",
        "prefer",
        "real",
        "stories",
        "mysteries",
        "and",
        "thrillers"
      ],
      "tip": "",
      "id": "A2-C14-T07",
      "targetWords": 6,
      "everyday": "Mostly comedies, to be honest.",
      "reactive": false,
      "openAnswer": true
    },
    {
      "prompt": "Do you prefer watching films or reading books?",
      "options": [
        "I prefer watching films.",
        "I prefer reading books.",
        "It depends on my mood."
      ],
      "keywords": [
        "i",
        "prefer",
        "watching",
        "films",
        "reading",
        "books",
        "it",
        "depends",
        "on",
        "my",
        "mood"
      ],
      "tip": "",
      "id": "A2-C14-T08",
      "targetWords": 6,
      "everyday": "Films, definitely.",
      "reactive": false,
      "openAnswer": true
    },
    {
      "prompt": "How often do you watch films or read books?",
      "options": [
        "I watch a film every week.",
        "I read a little every day.",
        "Not very often, honestly."
      ],
      "keywords": [
        "i",
        "watch",
        "a",
        "film",
        "every",
        "week",
        "read",
        "little",
        "day",
        "not",
        "very",
        "often"
      ],
      "tip": "",
      "id": "A2-C14-T09",
      "targetWords": 7,
      "everyday": "Pretty much every week.",
      "reactive": false,
      "openAnswer": true
    },
    {
      "prompt": "Thanks for sharing! Any final thoughts?",
      "options": [
        "No, that's everything, thanks.",
        "I'd just say it's worth watching.",
        "No, I think that's all, thank you."
      ],
      "keywords": [
        "no",
        "that's",
        "everything",
        "thanks",
        "i'd",
        "just",
        "say",
        "it's",
        "worth",
        "watching",
        "i",
        "think"
      ],
      "tip": "",
      "id": "A2-C14-T10",
      "targetWords": 6,
      "everyday": "Just that it's worth watching, really.",
      "reactive": true
    }
  ]
}
];
