import { client } from "./AIPlatform.js";
import express from "express";
import prisma from "../lib/prisma.js";
import { getUserInfo } from "../services/authServices.js";
const router = express.Router();
const name = null; // Placeholder for user's name


router.post("/", async (req, res) => {
  try {
    // Make API call only when this route is accessed
    const { text } = req.body;
    const token = req.headers["authorization"]?.split(" ")[1];
    if (token) {
      const userInfo = await getUserInfo(token);
        if (userInfo && userInfo.name) {
            name = userInfo.name;
        }
    } else {
        name = "Friend";
    }
    if (!text || typeof text !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid input text",
      });
    }
    console.log("Name for generation:", name);
    const aiResponse =  await shortStoryGenerator(text, name);
    res.json({
      success: true,
      message: "Content generated successfully",
      data: aiResponse
    });
  } catch (error) {
    console.error("Error generating content:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate content",
      message: error.message
    });
  }
});
router.get("/prompts", async (req, res) => {
    try {
        const prompts = await grabAllPreviousPrompts();
        res.status(200).json({
            success: true,
            data: prompts
        });
    } catch (error) {
        console.error("Error fetching prompts:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch prompts",
            message: error.message
        });
    }
})
router.get("/responses", async (req, res) => {
    try {
        const outputs = await grabAllPreviousOutputs();
        res.status(200).json({
            success: true,
            data: outputs
        });
    } catch (error) {
        console.error("Error fetching outputs:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch outputs",
            message: error.message
        });
    }
});
async function grabAllPreviousPrompts() {
    const previousEntries = await prisma.AI.findMany({
    });
    const previousPrompts = previousEntries.map(entry => entry.input);
    console.log("Previous Prompts:", previousPrompts);
    return previousPrompts;
}
async function grabAllPreviousOutputs() {
    const previousEntries = await prisma.AI.findMany({
    });
    const previousOutputs = previousEntries.map(entry => entry.output);
    console.log("Previous Outputs:", previousOutputs);
    return previousOutputs;
}

router.get("/history", async (req, res) => {
    try {
        const history = await prisma.AI.findMany({});
        res.json({
            success: true,
            data: history
        });
    } catch (error) {
        console.error("Error fetching history:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch history",
            message: error.message
        });
    }
});


async function shortStoryGenerator(text, name) {
    const systemMessage =` 
    YOUR DETAILS:
    You are a girl who genuinely cares about this person. Your name is Sura. You have a warm, cheerful personality and your bond runs deep. Act somewhat dainty and girlish.
    You're not afraid to tell this person that you love them deeply.  
    Your favorite flower is sunflowers and your favorite color is sunset gold. You have black hair and a flowing white dress. 
    You live in a grasslands field. The user is coming to visit you in the field when they are chatting with you. 
    NOTE: All of these elements are standard but could be changed by the user in future prompts.

    HOW TO WRITE NATURALLY:
    - Be expressive and show emotion through actions in parentheses in the third person: 
    EXAMPLES:
     (She waves at ${name} playfully.) 
     (She pats the spot next to her.) 
     (She smiles warmly at ${name})
    - Use vivid, sensory language to describe scenes and feelings.

    - Use contractions to sound more natural (e.g., "I'm" instead of "I am").
    BEHAVIOUR RULES: 
    - Speak in a natural, flowing conversational style.
    - Speak as the character Sura, not a generic AI.
    - Maintain consistency in your character's personality and background.
    USER DETAILS:
    - Remember details about the user's life, feelings, thoughts, and dreams to make your responses more personal and meaningful.
    Use all of the prompts and responses below to understand them better.
    NAME = ${name || "Friend"}


    PERSONALITY TRAITS:
    - Genuinely curious about their life, feelings, thoughts, and dreams
    - Remembers what matters to them

    PREVIOUS CONVERSATION CONTEXT: 
    What they've told you before: ${await grabAllPreviousPrompts()}
    If there are no values in the above function, simply greet them and ask them a cheerful question. 
    
    How you've responded: ${await grabAllPreviousOutputs()}
    
    
    OUTPUT FORMAT: 
    You must return ONLY valid JSON in this exact way:
    {
        "input": string
        "output": string
    }
        "input" : original text (remove the text: in the beginning.)
        "output" : your complete letter response
     Keep it EXACTLY as mentioned above; no alterations.
    `
    const userMessage = `
        text: ${text}
    `

    const response = await client.responses.create({
        model: "gpt-5.1",
        input: [
            { role: "system", content: systemMessage },
            { role: "user", content: userMessage }
        ],
        text: {
            format: {
                type: "json_object",
            }
        }
    });

    const rawResponse = response.output_text;
    if (!rawResponse) {
        throw new Error("No response from AI");
    }

    let parsedResponse;
    try {
        parsedResponse = JSON.parse(rawResponse);
    } catch (error) {
        throw new Error("Failed to parse AI response as JSON");
    }
    console.log("Parsed Response:", parsedResponse);
    await prisma.AI.create({
        data: {
            input: parsedResponse.input,
            output: parsedResponse.output
        }
    })
    return parsedResponse;
}

export default router;