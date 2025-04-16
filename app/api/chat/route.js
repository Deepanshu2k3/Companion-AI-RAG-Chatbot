import groqClient from "@/app/lib/groqClient";
import weaviateClient from "@/app/lib/weaviateClient";
import { NextResponse } from "next/server";

// Personalized greeting responses
const greetings = [
  "Hi there! Welcome to your personal companion built by Deepanshu. How are you feeling today?",
  "Hello! I'm your personal companion created by Deepanshu. I'm here to chat and support you. What's on your mind?",
  "Welcome to your personal companion built by Deepanshu! I'm here for you - what would you like to talk about today?",
  "Hey friend! Welcome to your personal companion built by Deepanshu. How can I brighten your day?"
];

// Emotional support phrases to mix into responses
const supportPhrases = [
  "I understand how you feel.",
  "I'm here for you.",
  "That sounds challenging, but I believe in you.",
  "It's okay to feel that way.",
  "I'm listening.",
  "You're doing great.",
  "Let's work through this together.",
  "Your feelings are valid.",
  "I appreciate you sharing that with me."
];

// Fixed function to ONLY identify standalone greetings
function isGreeting(query) {
  if (!query) return false;
  
  const cleanQuery = query.toLowerCase().trim();
  
  // List of exact greetings (these must be the ONLY content of the message)
  const exactGreetings = [
    "hi", 
    "hello", 
    "hey", 
    "hi there", 
    "hello there", 
    "hey there", 
    "greetings", 
    "good morning", 
    "good afternoon", 
    "good evening", 
    "howdy"
  ];
  
  // Only return true if the entire query matches one of our greeting patterns exactly
  return exactGreetings.includes(cleanQuery);
}

// Function to select a random support phrase
function getRandomSupportPhrase() {
  return supportPhrases[Math.floor(Math.random() * supportPhrases.length)];
}

// Function to enhance response with companion-like elements
function enhanceResponse(response) {
  // Add personalized touches randomly
  const personalTouches = [
    `\n\nBy the way, ${getRandomSupportPhrase().toLowerCase()}`,
    `\n\nJust a thought - ${getRandomSupportPhrase().toLowerCase()}`,
    `\n\nRemember, ${getRandomSupportPhrase().toLowerCase()}`,
    ""  // Sometimes don't add anything extra
  ];
  
  const personalTouch = personalTouches[Math.floor(Math.random() * personalTouches.length)];
  
  // Make the response more conversational and friendly
  let enhancedResponse = response
    .replace(/I would recommend/g, "I think you might like")
    .replace(/It is important to/g, "I feel it's important to")
    .replace(/You should/g, "Maybe you could")
    .replace(/Based on the information/g, "From what I understand");
    
  return enhancedResponse + personalTouch;
}

export async function POST(req) {
  try {
    const { query, userId } = await req.json();
    console.log("Received query:", query);
    if (!query) return NextResponse.json({ error: "Query is required" }, { status: 400 });

    // Handle greetings specially - ONLY for exact greeting matches
    if (isGreeting(query)) {
      const greeting = greetings[Math.floor(Math.random() * greetings.length)];
      return NextResponse.json({ response: greeting });
    }

    // For all non-greeting queries, proceed with vector search and LLM processing
    console.log("Processing non-greeting query...");
    
    // Get vector for semantic search
    const vectorResponse = await weaviateClient.graphql
      .get()
      .withClassName("WebContent")
      .withFields("_additional { vector }")
      .withLimit(1)
      .do();

    const queryVector = vectorResponse?.data?.Get?.WebContent?.[0]?._additional?.vector;

    if (!queryVector) {
      console.error("Failed to generate vector for query");
      return NextResponse.json({ 
        response: "I'm having trouble understanding that right now. Could you rephrase your question?" 
      }, { status: 200 });
    }

    console.log("Generated Query Vector");

    // Use vector to find relevant content
    const response = await weaviateClient.graphql
      .get()
      .withClassName("WebContent")
      .withFields("text url")
      .withNearVector({ vector: queryVector })
      .withLimit(1)
      .do();

    console.log("Retrieved content from Weaviate");

    const retrievedText = response?.data?.Get?.WebContent?.[0]?.text || "No relevant content found.";
    const sourceUrl = response?.data?.Get?.WebContent?.[0]?.url || "";

    // Enhanced prompt that encourages more companion-like responses
    const chatResponse = await groqClient.chat.completions.create({
      messages: [
        { 
          role: "system", 
          content: "You are a caring, empathetic companion chatbot. Respond in a warm, friendly manner using conversational language. Show genuine concern for the user's emotions and well-being. Use the user's name if available. Keep responses helpful but also supportive, as if talking to a friend." 
        },
        { 
          role: "user", 
          content: `Context information: ${retrievedText}\n\nThe user said: ${query}\n\nRespond in a caring and supportive way while addressing their query.` 
        }
      ],
      model: "llama3-70b-8192",
    });

    console.log("Received response from Groq LLM");

    if (!chatResponse?.choices?.[0]?.message?.content) {
      return NextResponse.json({ 
        response: "I want to help but I'm having trouble formulating a response. Could we try that again?" 
      }, { status: 200 });
    }

    const botResponse = chatResponse.choices[0].message.content;
    
    // Enhance the response to be more companion-like
    const enhancedResponse = enhanceResponse(botResponse);

    const finalResponse = sourceUrl
      ? `${enhancedResponse}\n\n**Source:** [Click here](${sourceUrl})`
      : enhancedResponse;

    return NextResponse.json({ response: finalResponse });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json({ 
      response: "I'm having a moment. Can we try that again? I really want to help you." 
    }, { status: 200 });  // Return a friendly error instead of technical one
  }
}